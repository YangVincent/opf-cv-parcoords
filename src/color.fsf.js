const colorFS = `
#define BASE_COLOR vec4(0.0, 1.0, 0.0, 1.0);

precision mediump float;

varying float alphaOut;

void main() {
    gl_FragColor = alphaOut * BASE_COLOR;
}
`;