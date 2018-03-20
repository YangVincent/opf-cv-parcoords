
let gl;

let binData;

function setGLObj(g) {
    if (!g) {
        alert("Unable to initalize WebGL.");
    }

    gl = g;
}

function initDraw() {
    if (!gl) return;

    const vertShad = loadShader(gl.VERTEX_SHADER, vsSource);

    gl.clearColor(0.0,0.0,0.0,0.0); // Set canvas to transparent and blank when clearing.
    gl.disable(gl.DEPTH_TEST);
}

function drawFrame() {
    resize();
    gl.clear(gl.COLOR_BUFFER_BIT);
    //
}

function redrawContext() {
    //
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
