const textureFS = `
precision mediump float;

varying vec2 posOut;

uniform sampler2D samp;

void main() {
    gl_FragColor = texture2D(samp, posOut);
}
`;