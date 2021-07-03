#version 300 es

// an attribute will receive data from a buffer
in vec4 a_position;
in vec3 a_normal;

// A matrix to transform the positions by
uniform mat4 matrix;

// varying to pass the normal to the fragment shader
out vec3 v_normal;

// all shaders have a main function
void main() {
    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = matrix * a_position;

    // Pass the normal to the fragment shader
    v_normal = a_normal;
}
