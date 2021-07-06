class ShaderClass {
}

class DefaultShaderClass extends ShaderClass {
	static vertexShaderFilename = "shaders/defaultVertexShader.glsl";
	static fragmentShaderFilename = "shaders/defaultFragmentShader.glsl";
	static useTexture = true;
}

class RingShaderClass extends ShaderClass {
	static vertexShaderFilename = "shaders/noTextureVertexShader.glsl";
	static fragmentShaderFilename = "shaders/ringFragmentShader.glsl";
	static useTexture = false;
}

class TerrainShaderClass extends ShaderClass {
	static vertexShaderFilename = "shaders/terrainVertexShader.glsl";
	static fragmentShaderFilename = "shaders/terrainFragmentShader.glsl";
	static useTexture = true;
}

export {DefaultShaderClass, RingShaderClass, TerrainShaderClass};