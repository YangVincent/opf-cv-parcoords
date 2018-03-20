let gl;

let shaderProg;

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
                gl.deleteBuffer(panel.vbo);
            }
        }
        initPanels(numPanels, gl.canvas.clientHeight);
    }
}

function initDraw() {
    if (!gl) return;


    resize();
    // TODO load shaders
    shaderProg = {program:linkShaderProgram(transVS, colorFS)};
    // const vertShad = gl.loadShader(gl.VERTEX_SHADER, vsSource);

    gl.clearColor(0.0,0.0,0.0,0.5); // Set canvas to transparent and blank when clearing.
    gl.disable(gl.DEPTH_TEST);

    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
}

function wglDrawFrame() {
    if (!gl) return;

    resize();
    gl.clear(gl.COLOR_BUFFER_BIT);
    //
}

function wglRedrawContext(context, dimensions) {
    if (!gl) return;

    //
    //
}

function wglDrawPanel(panelNum, dimLeft, dimRight, context) {
    const panel = parcoordsPanels[panelNum];

    gl.bindFramebuffer(panel.framebuffer);

    gl.viewport(0, 0, parcoordsPanels[panelNum].size, parcoordsPanels[panelNum].size);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, panel.vbo);

    let bufferData = [];

    if (dimLeft <= dimRight) {
        const binData = context[dimLeft][dimRight].bins;
        //
    } else {
        const binData = context[dimRight][dimLeft].bins;
        //
    }

    const lowerDim = lLTr ? dimLeft : dimRight;
    const higherDim = lLTr ? dimRight : dimLeft;

    const binData = context[lowerDim][higherDim].bins;



    // context[]
    // TODO select data
    // TODO draw data

    //
}

function initPanels(numFramebuffers, canvasHeight) {
    if (!gl) return;

    parcoordsPanels = [];

    for (let i = 0; i < numFramebuffers; ++i) {
        const panel = {framebuffer:gl.createFramebuffer(), texture:gl.createTexture(), size:canvasHeight, vbo:gl.createBuffer()};
        gl.bindFramebuffer(gl.FRAMEBUFFER, panel.framebuffer);
        gl.bindTexture(gl.TEXTURE_2D, panel.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, pane.size, panel.size, 0, gl.RGBA, gl.FLOAT, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, panel.texture, 0);
        parcoordsPanels.push(panel);
    }
    gl.bindFramebuffer(gl.TEXTURE_2D, null);
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
