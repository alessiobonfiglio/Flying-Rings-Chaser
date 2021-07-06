#version 300 es

in vec3 inPosition;					// vertex coordinates (local space)
in vec3 inNormal;					// normal coordinates (local space)

uniform vec3 cameraPosition;		// camera position (world space)
uniform vec3 lightsPositions[5];	// lights positions (world space)

out vec3 fsNormal;					// normal coordinates (world space)

out vec3 wr;						// eye direction (world space)
out vec3 lxs[5];					// light directions (world space)

uniform mat4 matrix;				// WVP Matrix
uniform mat4 nMatrix;				// world matrix for the normals (because we only use uniform scaling)

void main() {
	// compute the clip space coordinates
	gl_Position = matrix * vec4(inPosition, 1.0);

	// compute the normal in world space
	fsNormal = mat3(nMatrix) * inNormal;

	// convert the local coordinates to world coordinates
	vec4 tmp = nMatrix * vec4(inPosition, 1.0);
	vec3 position = tmp.xyz / tmp.w;

	// compute the eye direction
	wr = normalize(cameraPosition - position);

	// compute the lights directions
	lxs[0] = normalize(lightsPositions[0] - position);
	lxs[1] = normalize(lightsPositions[1] - position);
	lxs[2] = normalize(lightsPositions[2] - position);
	lxs[3] = normalize(lightsPositions[3] - position);
	lxs[4] = normalize(lightsPositions[4] - position);
}
