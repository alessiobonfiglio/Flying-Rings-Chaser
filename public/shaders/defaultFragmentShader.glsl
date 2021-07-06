#version 300 es

precision mediump float;

in vec3 fsNormal;
in vec2 fsTexCoords;

out vec4 outColor;

uniform vec3 mDiffColor;

uniform sampler2D objectTexture;

void main() {
	vec3 nNormal = normalize(fsNormal);
	outColor = texture(objectTexture, fsTexCoords);
}
