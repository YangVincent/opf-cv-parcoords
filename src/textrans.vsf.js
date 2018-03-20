const textransVS = `
precision mediump float;

attribute vec2 pos;
attribute vec2 tC;

varying vec2 posOut;

void main() {
    posOut = tC;
    gl_Position = vec4(pos, 0.0, 1.0);
}
`;