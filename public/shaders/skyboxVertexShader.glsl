#version 300 es

in vec3 inPosition;					// vertex coordinates (clip space)
     
out vec3 sampleDir;                 // direction to sample the cube map (clip space)
     
void main() {

  gl_Position = vec4(inPosition, 1.0);
 
  // Pass a normal. Since the positions are
  // centered around the origin we can just 
  // pass the position
  sampleDir = inPosition;
}