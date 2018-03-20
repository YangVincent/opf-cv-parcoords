const OUTLIER_INTENSITY = 0.35;

let gl;

let colorShaderProg;
let textureShaderProg;

let texCoordsVBO;
let panelCoordsVBO;

let parcoordsPanels = [];

function wglSetGLObj(g) {
    if (!g)
        alert("Unable to initalize WebGL.");

    gl = g;
}

function wglSetNumPanels(numPanels) {
    if (!gl) return;

    if (numPanels !== parcoordsPanels.length) {
        if (parcoordsPanels.length > 0) {
            for (const panel of parcoordsPanels) {
                gl.deleteTexture(panel.texture);
                gl.deleteFramebuffer(panel.framebuffer);
                gl.deleteBuffer(panel.trendsVBO);
                gl.deleteBuffer(panel.outliersVBO);
            }
        }
        initPanels(numPanels, gl.canvas.clientHeight);
    } else {
        for (const panel of parcoordsPanels) {
            panel.invalid = true;
        }
    }
}

function wglInvalidatePanel(index) {
    parcoordsPanels[index].invalid = true;
}

function initDraw() {
    if (!gl) return;

    resize();

    gl.clearColor(0.0,0.0,0.0,0.6); // Set canvas to transparent and blank when clearing.
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);

    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let shadProg = linkShaderProgram(transVS, colorFS);
    colorShaderProg = {
        program: shadProg,
        attribLocations: {
            pos: gl.getAttribLocation(shadProg, "pos"),
            alpha: gl.getAttribLocation(shadProg, "alpha")
        }
    };
    shadProg = linkShaderProgram(textransVS, textureFS);
    textureShaderProg = {
        program: shadProg,
        attribLocations: {
            pos: gl.getAttribLocation(shadProg, "pos"),
            tC: gl.getAttribLocation(shadProg, "tC")
        },
        uniformLocations: {
            samp: gl.getUniformLocation(shadProg, "samp")
        }
    };

    gl.useProgram(colorShaderProg.program);
    gl.enableVertexAttribArray(colorShaderProg.attribLocations.pos);
    gl.enableVertexAttribArray(colorShaderProg.attribLocations.alpha);

    gl.useProgram(textureShaderProg.program);
    gl.uniform1i(textureShaderProg.uniformLocations.samp, 0);
    gl.enableVertexAttribArray(textureShaderProg.attribLocations.pos);
    gl.enableVertexAttribArray(textureShaderProg.attribLocations.tC);

    texCoordsVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(textureShaderProg.attribLocations.tC, 2, gl.FLOAT, false, 0, 0);

    panelCoordsVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, panelCoordsVBO);
}

function wglDrawFrame(axesPositions) {
    if (!gl) return;

    gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // console.log(axesPositions);
    // TODO render panel textures.
    gl.useProgram(textureShaderProg.program);
    const inversePanelsLength = 1.0 / parcoordsPanels.length;
    let bufferData = [0,0,0,0,0,0,0,0];
    for (let i = 0; i < parcoordsPanels.length; ++i) {
        const xLeft = axesPositions[i] * 2 - 1;
        const xRight = axesPositions[i + 1] * 2 - 1;
        bufferData[0] = xLeft; bufferData[1] = 1;
        bufferData[2] = xLeft; bufferData[3] = -1;
        bufferData[4] = xRight; bufferData[5] = 1;
        bufferData[6] = xRight; bufferData[7] = -1;
        gl.bindTexture(gl.TEXTURE_2D, parcoordsPanels[i].texture);
        gl.bindBuffer(gl.ARRAY_BUFFER, panelCoordsVBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferData), gl.STATIC_DRAW);
        gl.vertexAttribPointer(textureShaderProg.attribLocations.pos, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsVBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0]), gl.STATIC_DRAW);
        gl.vertexAttribPointer(textureShaderProg.attribLocations.tC, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

function wglRedrawContext(context, dimensions) {
    if (!gl) return;

    for (let i = 0; i < parcoordsPanels.length; ++i) {
        wglDrawPanel(i, dimensions[i], dimensions[i+1], context);
    }
}

function wglDrawPanel(panelNum, dimLeft, dimRight, context) {
    const panel = parcoordsPanels[panelNum];
    gl.useProgram(colorShaderProg.program);

    gl.bindFramebuffer(gl.FRAMEBUFFER, panel.framebuffer);

    gl.viewport(0, 0, parcoordsPanels[panelNum].size, parcoordsPanels[panelNum].size);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, panel.trendsVBO);

    let bufferData = [];

    if (dimLeft <= dimRight) {
        const binData = context[dimLeft][dimRight].bins;
        const inverseLeftLength = 1.0 / binData.length;

        for (let i = 0; i < binData.length; ++i) {
            const inverseRightLength = 1.0 / binData[i].length;
            for (let j = 0; j < binData[i].length; ++j) {
                const value = binData[i][j];
                const leftTop = (i + 1) * inverseLeftLength * 2 - 1;
                const leftBottom = i * inverseLeftLength * 2 - 1;
                const rightTop = (j + 1) * inverseRightLength * 2 - 1;
                const rightBottom = j * inverseRightLength * 2 - 1;
                bufferData.push(-1);
                bufferData.push(leftTop);
                bufferData.push(value);
                bufferData.push(-1);
                bufferData.push(leftBottom);
                bufferData.push(value);
                bufferData.push(1);
                bufferData.push(rightTop);
                bufferData.push(value);
                bufferData.push(1);
                bufferData.push(rightTop);
                bufferData.push(value);
                bufferData.push(-1);
                bufferData.push(leftBottom);
                bufferData.push(value);
                bufferData.push(1);
                bufferData.push(rightBottom);
                bufferData.push(value);
            }
        }
    } else {
        const binData = context[dimRight][dimLeft].bins;
        const inverseRightLength = 1.0 / binData.length;

        for (let i = 0; i < binData.length; ++i) {
            const inverseLeftLength = 1.0 / binData[i].length;
            for (let j = 0; j < binData[i].length; ++j) {
                const value = binData[i][j];
                const leftTop = (j + 1) * inverseLeftLength * 2 - 1;
                const leftBottom = j * inverseLeftLength * 2 - 1;
                const rightTop = (i + 1) * inverseRightLength * 2 - 1;
                const rightBottom = i * inverseRightLength * 2 - 1;
                bufferData.push(-1);
                bufferData.push(leftTop);
                bufferData.push(value);
                bufferData.push(-1);
                bufferData.push(leftBottom);
                bufferData.push(value);
                bufferData.push(1);
                bufferData.push(rightTop);
                bufferData.push(value);
                bufferData.push(1);
                bufferData.push(rightTop);
                bufferData.push(value);
                bufferData.push(-1);
                bufferData.push(leftBottom);
                bufferData.push(value);
                bufferData.push(1);
                bufferData.push(rightBottom);
                bufferData.push(value);
            }
        }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferData), gl.STATIC_DRAW);

    gl.vertexAttribPointer(colorShaderProg.attribLocations.pos, 2, gl.FLOAT, false, 12, 0);
    gl.vertexAttribPointer(colorShaderProg.attribLocations.alpha, 1, gl.FLOAT, false, 12, 8);

    gl.drawArrays(gl.TRIANGLES, 0, bufferData.length / 3);

    bufferData = [];
    if (dimLeft <= dimRight) {
        const outlierData = context[dimLeft][dimRight].outliers;
        for (const outlier of outlierData) {
            bufferData.push(-1);
            bufferData.push(outlier[0] * 2 - 1);
            bufferData.push(OUTLIER_INTENSITY);
            bufferData.push(1);
            bufferData.push(outlier[1] * 2 - 1);
            bufferData.push(OUTLIER_INTENSITY);
        }
    } else {
        const outlierData = context[dimRight][dimLeft].outliers;
        for (const outlier of outlierData) {
            bufferData.push(-1);
            bufferData.push(outlier[1] * 2 - 1);
            bufferData.push(OUTLIER_INTENSITY);
            bufferData.push(1);
            bufferData.push(outlier[0] * 2 - 1);
            bufferData.push(OUTLIER_INTENSITY);
        }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferData), gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorShaderProg.attribLocations.pos, 2, gl.FLOAT, false, 12, 0);
    gl.vertexAttribPointer(colorShaderProg.attribLocations.alpha, 1, gl.FLOAT, false, 12, 8);
    gl.drawArrays(gl.LINES, 0, bufferData.length / 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function initPanels(numFramebuffers, canvasHeight) {
    if (!gl) return;

    parcoordsPanels = [];

    for (let i = 0; i < numFramebuffers; ++i) {
        const panel = {framebuffer:gl.createFramebuffer(), texture:gl.createTexture(), size:canvasHeight, invalid: true,
            trendsVBO:gl.createBuffer(), outliersVBO:gl.createBuffer()};
        gl.bindFramebuffer(gl.FRAMEBUFFER, panel.framebuffer);
        gl.bindTexture(gl.TEXTURE_2D, panel.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, panel.size, panel.size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, panel.texture, 0);
        parcoordsPanels.push(panel);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function linkShaderProgram(vsSource, fsSource) {
    if (!gl) return;

    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function loadShader(type, source) {
    if (!gl) return;

    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function resize() {
    const displayWidth = gl.canvas.clientWidth;
    const displayHeight = gl.canvas.clientHeight;


    if (gl.canvas.width !== displayWidth || gl.canvas.height !== displayHeight) {
        gl.canvas.width = displayWidth;
        gl.canvas.height = displayHeight;

        gl.viewport(0, 0, displayWidth, displayHeight);
    }
}
