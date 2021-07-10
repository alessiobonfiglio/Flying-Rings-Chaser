#version 300 es

#define PI radians(180.0)
#define LIGHTS_NUM 5

precision mediump float;

in vec3 fsNormal;						// normal to the surface (world space)
in vec3 wr;								// eye direction (world space)

out vec4 outColor;						// computed color

uniform vec3 mDiffColor;				// diffuse color

in vec3 lxs[LIGHTS_NUM];				// lights direction (world space)
uniform bool lxsEnabled[LIGHTS_NUM];	// if lights are enabled or not
in float lightsDistances[LIGHTS_NUM];	// distance of the vertex from the light source (squared)

const float maxLightDistance = 200.0;   // distance from that light lights starts become weaker

const float u = 1.0;					// metalness of the ring
const float alpha = 0.2;				// roughness of the ring

vec3 nNormal;

vec3 hlx(vec3 lx) {
	return normalize(wr + lx);
}

vec3 diffuse(vec3 lx) {
	return mDiffColor * dot(lx, nNormal);
}

float D(vec3 lx) {
	float tmp1 = clamp(dot(nNormal, hlx(lx)), 0.0, 1.0);
	float tmp2 = tmp1 * tmp1 * (alpha * alpha - 1.0) + 1.0;
	return (alpha * alpha) / (PI * tmp2 * tmp2);
}

vec3 F(vec3 lx) {
	vec3 F0 = u * mDiffColor + 0.04 * (1.0 - u);
	float tmp_1 = 1.0 - clamp(dot(wr, hlx(lx)), 0.0, 1.0);
	float tmp_2 = tmp_1 * tmp_1;
	float tmp_5 = tmp_2 * tmp_2 * tmp_1;
	return F0 + (1.0 - F0) * tmp_5;
}

float g_GGX(vec3 n, vec3 a) {
	float k = (alpha + 1.0) * (alpha + 1.0) / 8.0;
	float tmp = clamp(dot(n, a), 0.0, 1.0);
	return tmp / ((1.0 - k) * tmp + k);
}

float G(vec3 lx) {
	return g_GGX(nNormal, wr) * g_GGX(nNormal, lx);
}

vec3 specular(vec3 lx) {
	return (D(lx) * F(lx) * G(lx)) / (4.0 * clamp(dot(wr, nNormal), 0.0, 1.0));
}

vec3 fr(vec3 lx) {
	return (1.0 - F(lx)) * (1.0 - u) * diffuse(lx) + specular(lx);
}

void main() {
	// normalize the normal to the surface
	nNormal = normalize(fsNormal);

	// computer the PBR color wrt each light source
	vec3 sum;
	float lightDistanceCoefficient;
	lightDistanceCoefficient = clamp(maxLightDistance*maxLightDistance/lightsDistances[0], 0.0, 1.0);
	sum = fr(lxs[0]) * float(lxsEnabled[0]) * lightDistanceCoefficient;
	lightDistanceCoefficient = clamp(maxLightDistance*maxLightDistance/lightsDistances[1], 0.0, 1.0);
	sum += fr(lxs[1]) * float(lxsEnabled[1]) * lightDistanceCoefficient;
	lightDistanceCoefficient = clamp(maxLightDistance*maxLightDistance/lightsDistances[2], 0.0, 1.0);
	sum += fr(lxs[2]) * float(lxsEnabled[2]) * lightDistanceCoefficient;
	lightDistanceCoefficient = clamp(maxLightDistance*maxLightDistance/lightsDistances[3], 0.0, 1.0);
	sum += fr(lxs[3]) * float(lxsEnabled[3]) * lightDistanceCoefficient;
	lightDistanceCoefficient = clamp(maxLightDistance*maxLightDistance/lightsDistances[4], 0.0, 1.0);
	sum += fr(lxs[4]) * float(lxsEnabled[4]) * lightDistanceCoefficient;

	// sum all the colors and clamp them
	outColor = vec4(clamp(sum, 0.0, 1.0), 1.0);
}

