
let gl;

function setGLObj(g) {
    if (!g) {
        alert("Unable to initalize WebGL.");
    }

    gl = g;
}

function initDraw() {
    if (!gl) return;

    gl.clearColor(0.0,0.0,0.0,0.0); // Set canvas to transparent and blank when clearing.
    gl.disable(gl.DEPTH_TEST);
}

function drawFrame() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    //
}
