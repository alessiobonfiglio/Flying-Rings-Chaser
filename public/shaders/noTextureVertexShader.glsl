#version 300 es

in vec3 inPosition;// vertex coordinates (local space)
in vec3 inNormal;// normal coordinates (local space)

uniform vec3 cameraPosition;// camera position (world coordinates)
uniform vec3 lightsPositions[5];// lights positions (world coordinates)

out vec3 fsNormal;// normal coordinates (clip coordinates)

out vec3 wr;// eye direction (world coordinates)
out vec3 lxs[5];// light directions (world coordinates)

uniform mat4 matrix;// WVP Matrix
uniform mat4 nMatrix;// world matrix for the normals (because we only use uniform scaling)

void main() {
	gl_Position = matrix * vec4(inPosition, 1.0);

	fsNormal = mat3(nMatrix) * inNormal;

	// convert the local coordinates to world coordinates
	vec4 tmp = nMatrix * vec4(inPosition, 1.0);
	vec3 position = vec3(tmp.x/tmp.w, tmp.y/tmp.w, tmp.z/tmp.w);

	wr = normalize(cameraPosition - position);

	lxs[0] = normalize(lightsPositions[0] - position);
	lxs[1] = normalize(lightsPositions[1] - position);
	lxs[2] = normalize(lightsPositions[2] - position);
	lxs[3] = normalize(lightsPositions[3] - position);
	lxs[4] = normalize(lightsPositions[4] - position);
}
