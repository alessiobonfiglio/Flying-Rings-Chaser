#version 300 es

precision mediump float;

in vec3 fsNormal;						// normal to the surface (world space)
in vec2 fsTexCoords;					// texture coordinates (uv space - repeated)

out vec4 outColor;						// the computed color

uniform sampler2D objectTexture;		// texture object

void main() {
	vec3 nNormal = normalize(fsNormal);
    outColor = texture(objectTexture, fsTexCoords);
}
