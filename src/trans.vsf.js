const vsSource = `
attribute vec2 pos;
attribute vec4 colorIn;

varying vec4 colorOut;

void main() {
    colorOut = colorIn;
    gl_Position = vec4(pos,0.0,1.0);
}
`;