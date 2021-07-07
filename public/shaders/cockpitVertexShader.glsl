#version 300 es

in vec3 inPosition;
in vec3 inNormal;

out vec3 fsPosition;
out vec3 fsNormal;

uniform mat4 matrix;
uniform mat4 nMatrix;

void main() {
	gl_Position = matrix * vec4(inPosition, 1.0);

	fsPosition = inPosition;
	fsNormal = mat3(nMatrix) * inNormal;
}
