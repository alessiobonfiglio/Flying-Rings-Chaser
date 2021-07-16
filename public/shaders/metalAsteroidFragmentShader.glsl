#version 300 es

#define LIGHTS_NUM 10

precision mediump float;

in vec3 fsNormal;						// normal to the surface (world space)
in vec2 fsTexCoords;					// texture coordinates (uv space - repeated)
in vec3 wr;								// eye direction (world space)

out vec4 outColor;						// the computed color

in vec3 lxs[LIGHTS_NUM];				// lights direction (world space)
uniform bool lxsEnabled[LIGHTS_NUM];	// if lights are enabled or not
in float lightsDistances[LIGHTS_NUM];	// distance of the vertex from the light source (squared)

uniform sampler2D objectTexture;		// texture object

const float maxLightDistance = 200.0;   // distance from that lights start to become weaker
const float laserReduction = 0.3;		// reduction of the light intensity of the lasers

const float SpecShine = 50.0;			// gamma factor for the bling specular

const vec3 spaceshipLightColor = vec3(1.0, 1.0, 1.0);
const vec3 laserLightColor = vec3(0.0, 0.4, 0.98);

const vec3 specularColor = vec3(0.940, 0.923, 0.963);

void main() {
	vec3 nNormal = normalize(fsNormal);

	vec3 texColor = texture(objectTexture, fsTexCoords).xyz;

	// compute the lambert diffuse and blinn specular of each light source
	float lightDistanceCoefficient = clamp(maxLightDistance*maxLightDistance/lightsDistances[0], 0.0, 1.0);
	vec3 diffuseComponent = spaceshipLightColor * clamp(dot(lxs[0], nNormal), 0.0, 1.0) * float(lxsEnabled[0]) * lightDistanceCoefficient;
	vec3 specularComponent = spaceshipLightColor * pow(clamp(dot(normalize(wr + lxs[0]), nNormal), 0.0, 1.0), SpecShine) * lightDistanceCoefficient;
	for (int i = 1; i < LIGHTS_NUM; i++) {
		lightDistanceCoefficient = clamp(maxLightDistance*maxLightDistance/lightsDistances[i], 0.0, 1.0);
		diffuseComponent += laserLightColor * clamp(dot(lxs[i], nNormal), 0.0, 1.0) * float(lxsEnabled[i]) * lightDistanceCoefficient * laserReduction;
		specularComponent += laserLightColor * pow(clamp(dot(normalize(wr + lxs[i]), nNormal), 0.0, 1.0), SpecShine) * float(lxsEnabled[i]) * lightDistanceCoefficient * laserReduction;
	}

	// compute the final color of the pixel
	vec3 color = texColor * diffuseComponent + specularColor * specularComponent;
	color = clamp(color, 0.0, 1.0);
	outColor = vec4(color , 1.0);
}
