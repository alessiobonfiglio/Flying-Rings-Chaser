#version 300 es

#define LIGHTS_NUM 10

precision mediump float;

in vec3 fsPosition;						// position coordinates (world space)
in vec2 fsTexCoords;					// texture coordinates (uv space - repeated)

out vec4 outColor;						// the computed color

in vec3 lxs[LIGHTS_NUM];				// lights direction (world space)
uniform bool lxsEnabled[LIGHTS_NUM];	// if lights are enabled or not
in float lightsDistances[LIGHTS_NUM];	// distance of the vertex from the light source (squared)

uniform sampler2D objectTexture;		// texture object

const float maxLightDistance = 130.0;   // distance from that lights start to become weaker
const float laserReduction = 0.5;		// reduction of the light intensity of the lasers

void main() {

	// compute the normal to the surface using the derivatives offered by WebGL
	vec3 nNormal = normalize(cross(dFdx(fsPosition), dFdy(fsPosition)));

	vec3 texColor = texture(objectTexture, fsTexCoords).xyz;

	// compute the lambert diffuse of each light source
	float lightDistanceCoefficient = clamp(maxLightDistance*maxLightDistance/lightsDistances[0], 0.0, 1.0);
	float diffuseIntensity = dot(lxs[0], nNormal) * float(lxsEnabled[0]) * lightDistanceCoefficient;
	for (int i = 1; i < LIGHTS_NUM; i++) {
		lightDistanceCoefficient = clamp(maxLightDistance*maxLightDistance/lightsDistances[i], 0.0, 1.0);
		diffuseIntensity += dot(lxs[i], nNormal) * float(lxsEnabled[i]) * lightDistanceCoefficient * laserReduction;
	}

	// compute the lambert diffuse color
	outColor = vec4(texColor * clamp(diffuseIntensity, 0.0, 1.0), 1.0);
}
