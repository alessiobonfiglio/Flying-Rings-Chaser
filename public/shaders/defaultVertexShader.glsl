#version 300 es

#define LIGHTS_NUM 10

in vec3 inPosition;							// vertex coordinates (local space)
in vec3 inNormal;							// normal coordinates (local space)
in vec2 inTexCoords;						// texture coordinates (uv space)

out vec3 fsNormal;							// normal coordinates (clip coordinates)
out vec2 fsTexCoords;						// texture coordinates (uv space - repeated)

uniform vec3 lightsPositions[LIGHTS_NUM];	// lights positions (world space)
out vec3 lxs[LIGHTS_NUM];					// light directions (world space)
out float lightsDistances[LIGHTS_NUM];		// distance of the vertex from the light source (squared)

uniform mat4 matrix;						// WVP Matrix
uniform mat4 nMatrix;						// world matrix for the normals (because we only use uniform scaling)

void main() {
	gl_Position = matrix * vec4(inPosition, 1.0);

	fsNormal = mat3(nMatrix) * inNormal;

	fsTexCoords = inTexCoords;

	// convert the local coordinates to world coordinates
	vec4 tmp = nMatrix * vec4(inPosition, 1.0);
	vec3 position = tmp.xyz / tmp.w;

	// compute the lights directions and distances
	vec3 lightsDirection;
	for (int i = 0; i < LIGHTS_NUM; i++) {
		lightsDirection = lightsPositions[i] - position;
		lxs[i] = normalize(lightsDirection);
		lightsDistances[i] = lightsDirection.x*lightsDirection.x + lightsDirection.y*lightsDirection.y + lightsDirection.z*lightsDirection.z;
	}
}
