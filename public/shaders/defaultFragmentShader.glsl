#version 300 es

#define LIGHTS_NUM 5

precision mediump float;

in vec3 fsNormal;						// normal to the surface (world space)
in vec2 fsTexCoords;					// texture coordinates (uv space - repeated)

out vec4 outColor;						// the computed color

in vec3 lxs[LIGHTS_NUM];				// lights direction (world space)
uniform bool lxsEnabled[LIGHTS_NUM];	// if lights are enabled or not
in float lightsDistances[LIGHTS_NUM];	// distance of the vertex from the light source (squared)

uniform sampler2D objectTexture;		// texture object

const float maxLightDistance = 200.0;   // distance from that light lights starts become weaker

void main() {
	vec3 nNormal = normalize(fsNormal);

	vec3 texColor = texture(objectTexture, fsTexCoords).xyz;

	// compute the lambert diffuse of each light source
	float lightDistanceCoefficient, diffuseIntensity;
	lightDistanceCoefficient = clamp(maxLightDistance*maxLightDistance/lightsDistances[0], 0.0, 1.0);
	diffuseIntensity = dot(lxs[0], nNormal) * float(lxsEnabled[0]) * lightDistanceCoefficient;
	lightDistanceCoefficient = clamp(maxLightDistance*maxLightDistance/lightsDistances[1], 0.0, 1.0);
	diffuseIntensity += dot(lxs[1], nNormal) * float(lxsEnabled[1]) * lightDistanceCoefficient;
	lightDistanceCoefficient = clamp(maxLightDistance*maxLightDistance/lightsDistances[2], 0.0, 1.0);
	diffuseIntensity += dot(lxs[2], nNormal) * float(lxsEnabled[2]) * lightDistanceCoefficient;
	lightDistanceCoefficient = clamp(maxLightDistance*maxLightDistance/lightsDistances[3], 0.0, 1.0);
	diffuseIntensity += dot(lxs[3], nNormal) * float(lxsEnabled[3]) * lightDistanceCoefficient;
	lightDistanceCoefficient = clamp(maxLightDistance*maxLightDistance/lightsDistances[4], 0.0, 1.0);
	diffuseIntensity += dot(lxs[4], nNormal) * float(lxsEnabled[4]) * lightDistanceCoefficient;

	// compute the lambert diffuse color
	outColor = vec4(texColor * clamp(diffuseIntensity, 0.0, 1.0), 1.0);
}
