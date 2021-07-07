#version 300 es

in vec3 inPosition;								// vertex coordinates (local space)
in vec3 inNormal;								// normal coordinates (local space)
in vec2 inTexCoords;							// texture coordinates (uv space)

out vec3 fsPosition;							// vertex coordinates (world space)
out vec2 fsTexCoords;							// texture coordinates (uv space - repeated)

uniform vec3 lightsPositions[5];				// lights positions (world space)
out vec3 lxs[5];								// light directions (world space)

uniform float increment;						// incremenat along z to mimic the movement

uniform mat4 matrix;							// WVP Matrix
uniform mat4 nMatrix;							// world matrix for the normals (because we only use uniform scaling)

const float textureMoltiplicationFactor = 40.0;	// how many times repeat the texture
const float noiseFactor = 7.0;					// how much the noise varies the Y coordinate


vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

vec4 mod289(vec4 x) {
	return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
	return mod289(((x*34.0)+1.0)*x);
}

float cnoise(vec2 P){
	vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
	vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
	Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
	vec4 ix = Pi.xzxz;
	vec4 iy = Pi.yyww;
	vec4 fx = Pf.xzxz;
	vec4 fy = Pf.yyww;
	vec4 i = permute(permute(ix) + iy);
	vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
	vec4 gy = abs(gx) - 0.5;
	vec4 tx = floor(gx + 0.5);
	gx = gx - tx;
	vec2 g00 = vec2(gx.x,gy.x);
	vec2 g10 = vec2(gx.y,gy.y);
	vec2 g01 = vec2(gx.z,gy.z);
	vec2 g11 = vec2(gx.w,gy.w);
	vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
	g00 *= norm.x;
	g01 *= norm.y;
	g10 *= norm.z;
	g11 *= norm.w;
	float n00 = dot(g00, vec2(fx.x, fy.x));
	float n10 = dot(g10, vec2(fx.y, fy.y));
	float n01 = dot(g01, vec2(fx.z, fy.z));
	float n11 = dot(g11, vec2(fx.w, fy.w));
	vec2 fade_xy = fade(Pf.xy);
	vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
	float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
	return 2.3 * n_xy;
}

void main() {

	// get position in world coordinates and pass it to the fragment shader
	vec4 worldPosition4 = nMatrix * vec4(inPosition, 1.0);
	fsPosition = worldPosition4.xyz / worldPosition4.w;

	// add noise to the local coordinates and then make clip coordinates
	vec2 noiseIndex = fsPosition.xz;
	noiseIndex.y += increment;
	vec3 newPosition = inPosition;
	newPosition.y += cnoise(noiseIndex) * noiseFactor;
	gl_Position = matrix * vec4(newPosition, 1.0);

	// multiply the texture coordinates in order to repeat the texture
	vec2 newTexCoords = inTexCoords;
	fsTexCoords = newTexCoords * textureMoltiplicationFactor;
	//fsTexCoords.y += increment*0.1;

	// compute the direction of the various light sources
	lxs[0] = normalize(lightsPositions[0] - fsPosition);
	lxs[1] = normalize(lightsPositions[1] - fsPosition);
	lxs[2] = normalize(lightsPositions[2] - fsPosition);
	lxs[3] = normalize(lightsPositions[3] - fsPosition);
	lxs[4] = normalize(lightsPositions[4] - fsPosition);
}
