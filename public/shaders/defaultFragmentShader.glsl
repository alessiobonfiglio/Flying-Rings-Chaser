#version 300 es

#define LIGHTS_NUM 10

precision mediump float;

in vec3 fsNormal;						// normal to the surface (world space)
in vec2 fsTexCoords;					// texture coordinates (uv space - repeated)

out vec4 outColor;						// the computed color

in vec3 lxs[LIGHTS_NUM];				// lights direction (world space)
uniform bool lxsEnabled[LIGHTS_NUM];	// if lights are enabled or not
in float lightsDistances[LIGHTS_NUM];	// distance of the vertex from the light source (squared)

uniform sampler2D objectTexture;		// texture object

const float maxLightDistance = 200.0;   // distance from that lights start to become weaker
const float laserReduction = 0.2;		// reduction of the light intensity of the lasers


vec3 clamp3(vec3 v) {
	return vec3(clamp(v[0], 0.0, 1.0), clamp(v[1], 0.0, 1.0), clamp(v[2], 0.0, 1.0));
}



void main() {
	vec3 nNormal = normalize(fsNormal);

	vec3 texColor = texture(objectTexture, fsTexCoords).xyz;

	// compute the lambert diffuse of each light source
	float lightDistanceCoefficient = clamp(maxLightDistance*maxLightDistance/lightsDistances[0], 0.0, 1.0);
	vec3 diffuseComponent = dot(lxs[0], nNormal) * float(lxsEnabled[0]) * lightDistanceCoefficient * vec3(1.0, 1.0, 1.0);
	for (int i = 1; i < LIGHTS_NUM; i++) {
		lightDistanceCoefficient = clamp(maxLightDistance*maxLightDistance/lightsDistances[i], 0.0, 1.0);
		diffuseComponent += dot(lxs[i], nNormal) * float(lxsEnabled[i]) * lightDistanceCoefficient * laserReduction * vec3(0,  0.0,1.0);
	}

	vec3 color = texColor * diffuseComponent;
	color = clamp3(color);
	// compute the lambert diffuse color	
	outColor = vec4(color , 1.0);
}
