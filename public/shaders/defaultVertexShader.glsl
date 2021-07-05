#version 300 es

in vec3 inPosition;
in vec3 inNormal;
in vec2 inTexCoords;

out vec3 fsNormal;
out vec2 fsTexCoords;

uniform mat4 matrix;
uniform mat4 nMatrix;

void main() {
    gl_Position = matrix * vec4(inPosition, 1.0);

    fsNormal = mat3(nMatrix) * inNormal;

    fsTexCoords = inTexCoords;
}
