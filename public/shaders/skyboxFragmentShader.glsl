#version 300 es

precision mediump float;

in vec3 sampleDir;                  // direction to sample the cube map (clip space)
 
uniform samplerCube objectTexture;  // texture object
uniform mat4 inverseMVPMatrix;      // inverse of the MVP matrix

out vec4 outColor;
 
void main() {
    // transform back the clip space coordinates to the word space and use them as index for the cube map
    vec4 p = inverseMVPMatrix * vec4(sampleDir, 1.0);
    vec4 rgba = texture(objectTexture, normalize(p.xyz / p.w));
    
    outColor = vec4(rgba.rgb, 1.0);
}
