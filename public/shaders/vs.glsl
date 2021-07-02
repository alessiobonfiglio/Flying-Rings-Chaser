#version 300 es

// an attribute will receive data from a buffer
in vec3 a_position;
uniform mat4 matrix; 

// all shaders have a main function
void main() {
    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = matrix * vec4(a_position,1.0);
}

