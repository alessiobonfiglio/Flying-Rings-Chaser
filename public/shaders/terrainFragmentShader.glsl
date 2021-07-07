#version 300 es

precision mediump float;

in vec3 fsPosition;					// position coordinates (world space)
in vec2 fsTexCoords;				// texture coordinates (uv space - repeated)

out vec4 outColor;					// the computed color

in vec3 lxs[5];						// lights direction (world space)
uniform bool lxsEnabled[5];			// if lights are enabled or not

uniform sampler2D objectTexture;	// texture object

void main() {

	// compute the normal to the surface using the derivatves offered by WebGL
	vec3 nNormal = normalize(cross(dFdx(fsPosition), dFdy(fsPosition)));
	vec3 texColor = texture(objectTexture, fsTexCoords).xyz;

	// compute the lambert diffuse of each light source
	float diffuseIntensity = dot(lxs[0], nNormal) * float(lxsEnabled[0]);
	diffuseIntensity += dot(lxs[1], nNormal) * float(lxsEnabled[1]);
	diffuseIntensity += dot(lxs[2], nNormal) * float(lxsEnabled[2]);
	diffuseIntensity += dot(lxs[3], nNormal) * float(lxsEnabled[3]);
	diffuseIntensity += dot(lxs[4], nNormal) * float(lxsEnabled[4]);

	// compute the lambert diffuse color
	outColor = vec4(texColor * clamp(diffuseIntensity, 0.0, 1.0), 1.0);
}