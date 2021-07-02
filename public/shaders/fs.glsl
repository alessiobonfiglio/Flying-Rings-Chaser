#version 300 es
    
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;
out vec4 fragColor;

void main() {
    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    fragColor = vec4(0.6, 0.6, 0.1, 1.0);
}
