#version 300 es

in vec3 inPosition;// vertex coordinates (local space)
in vec3 inNormal;// normal coordinates (local space)
in vec2 inTexCoords;

out vec3 fsNormal;// normal coordinates (clip coordinates)
out vec2 fsTexCoords;

uniform mat4 matrix;// WVP Matrix
uniform mat4 nMatrix;// world matrix for the normals (because we only use uniform scaling)

void main() {
	gl_Position = matrix * vec4(inPosition, 1.0);

	fsNormal = mat3(nMatrix) * inNormal;

	fsTexCoords = inTexCoords;
}
