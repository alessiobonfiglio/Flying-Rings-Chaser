#version 300 es

#define LIGHTS_NUM 5

precision mediump float;

in vec3 fsPosition;						// position coordinates (world space)
in vec2 fsTexCoords;					// texture coordinates (uv space - repeated)

out vec4 outColor;						// the computed color

in vec3 lxs[LIGHTS_NUM];				// lights direction (world space)
uniform bool lxsEnabled[LIGHTS_NUM];	// if lights are enabled or not
in float lightsDistances[LIGHTS_NUM];	// distance of the vertex from the light source (squared)

uniform sampler2D objectTexture;		// texture object

const float maxLightDistance = 200.0;   // distance from that lights start to become weaker

void main() {

	// compute the normal to the surface using the derivatives offered by WebGL
	vec3 nNormal = normalize(cross(dFdx(fsPosition), dFdy(fsPosition)));

	vec3 texColor = texture(objectTexture, fsTexCoords).xyz;

	// compute the lambert diffuse of each light source
	float lightDistanceCoefficient, diffuseIntensity = 0.0;
	for(int i = 0; i < LIGHTS_NUM; i++) {
		lightDistanceCoefficient = clamp(maxLightDistance*maxLightDistance/lightsDistances[i], 0.0, 1.0);
		diffuseIntensity += dot(lxs[i], nNormal) * float(lxsEnabled[i]) * lightDistanceCoefficient;
	}

	// compute the lambert diffuse color
	outColor = vec4(texColor * clamp(diffuseIntensity, 0.0, 1.0), 1.0);
}
