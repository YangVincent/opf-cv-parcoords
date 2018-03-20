const transVS = `
precision mediump float;

attribute vec2 pos;
attribute float alpha;

varying float alphaOut;

void main() {
    alphaOut = alpha;
    gl_Position = vec4(pos, 0.0, 1.0);
}
`;