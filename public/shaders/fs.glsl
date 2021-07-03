#version 300 es
    
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;
out vec4 fragColor;

// Passed in and varied from the vertex shader.
in vec3 v_normal;

void main() {
    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    fragColor = vec4(v_normal, 1.0);
}
