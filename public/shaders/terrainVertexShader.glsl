#version 300 es

#define LIGHTS_NUM 10

in vec3 inPosition;								// vertex coordinates (local space)
in vec3 inNormal;								// normal coordinates (local space)
in vec2 inTexCoords;							// texture coordinates (uv space)

out vec3 fsPosition;							// vertex coordinates (world space)
out vec2 fsTexCoords;							// texture coordinates (uv space - repeated)

uniform vec3 lightsPositions[LIGHTS_NUM];		// lights positions (world space)
out vec3 lxs[LIGHTS_NUM];						// light directions (world space)
out float lightsDistances[LIGHTS_NUM];			// distance of the vertex from the light source (squared)

uniform float zOffset;							// offset of the terrain in the z coordinate (world space)

uniform mat4 matrix;							// WVP Matrix
uniform mat4 nMatrix;							// world matrix for the normals (because we only use uniform scaling)

const float textureMultiplicationFactor = 32.0;	// how many times repeat the texture
const float noiseFactor = 13.0;					// how much the noise varies the Y coordinate
const float noiseResolution =  0.01;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
	const vec4 C = vec4(0.211324865405187, 0.366025403784439,
	-0.577350269189626, 0.024390243902439);
	vec2 i  = floor(v + dot(v, C.yy) );
	vec2 x0 = v -   i + dot(i, C.xx);
	vec2 i1;
	i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
	vec4 x12 = x0.xyxy + C.xxzz;
	x12.xy -= i1;
	i = mod(i, 289.0);
	vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
	+ i.x + vec3(0.0, i1.x, 1.0 ));
	vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
	dot(x12.zw,x12.zw)), 0.0);
	m = m*m ;
	m = m*m ;
	vec3 x = 2.0 * fract(p * C.www) - 1.0;
	vec3 h = abs(x) - 0.5;
	vec3 ox = floor(x + 0.5);
	vec3 a0 = x - ox;
	m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
	vec3 g;
	g.x  = a0.x  * x0.x  + h.x  * x0.y;
	g.yz = a0.yz * x12.xz + h.yz * x12.yw;
	return 130.0 * dot(m, g);
}

void main() {

	// get position in world coordinates and pass it to the fragment shader
	vec4 worldPosition4 = nMatrix * vec4(inPosition, 1.0);
	fsPosition = worldPosition4.xyz / worldPosition4.w;

	// add noise to the local coordinates and then make clip coordinates
	vec2 noiseIndex = vec2(fsPosition.x, inPosition.z + zOffset) * noiseResolution;
	vec3 newPosition = inPosition;
	newPosition.y += snoise(noiseIndex) * noiseFactor;
	gl_Position = matrix * vec4(newPosition, 1.0);

	// multiply the texture coordinates in order to repeat the texture
	fsTexCoords = inTexCoords * textureMultiplicationFactor;

	// compute the direction ad distances of the various light sources
	vec3 lightsDirection;
	for (int i = 0; i < LIGHTS_NUM; i++) {
		lightsDirection = lightsPositions[i] - fsPosition;
		lxs[i] = normalize(lightsDirection);
		lightsDistances[i] = lightsDirection.x*lightsDirection.x + lightsDirection.y*lightsDirection.y + lightsDirection.z*lightsDirection.z;
	}
}
