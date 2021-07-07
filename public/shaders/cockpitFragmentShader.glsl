#version 300 es

precision mediump float;

in vec3 fsPosition;
in vec3 fsNormal;

out vec4 outColor;

uniform vec3 mDiffColor;

void main() {
	vec3 nNormal = normalize(fsNormal);
    outColor = vec4((fsPosition + fsNormal) / 2.0, 1.0);
}
