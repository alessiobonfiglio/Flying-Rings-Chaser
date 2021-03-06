class ShaderClass {
}

class DefaultShaderClass extends ShaderClass {
	static vertexShaderFilename = "shaders/defaultVertexShader.glsl";
	static fragmentShaderFilename = "shaders/defaultFragmentShader.glsl";
	static useTexture = true;
}

class metalAsteroidShaderClass extends ShaderClass {
	static vertexShaderFilename = "shaders/metalAsteroidVertexShader.glsl";
	static fragmentShaderFilename = "shaders/metalAsteroidFragmentShader.glsl";
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

class CockpitShaderClass extends ShaderClass {
	static vertexShaderFilename = "shaders/cockpitVertexShader.glsl";
	static fragmentShaderFilename = "shaders/cockpitFragmentShader.glsl";
	static useTexture = true;
}

class CockpitScreenShaderClass extends ShaderClass {
	static vertexShaderFilename = "shaders/cockpitScreenVertexShader.glsl";
	static fragmentShaderFilename = "shaders/cockpitFragmentShader.glsl";
	static useTexture = true;
}

class SkyboxShaderClass extends ShaderClass {
	static vertexShaderFilename = "shaders/skyboxVertexShader.glsl";
	static fragmentShaderFilename = "shaders/skyboxFragmentShader.glsl";
	static useTexture = true;
}

class NoTextureShaderClass extends ShaderClass {
	static vertexShaderFilename = "shaders/skyboxVertexShader.glsl";
	static fragmentShaderFilename = "shaders/skyboxFragmentShader.glsl";
	static useTexture = false;
}

export {NoTextureShaderClass, DefaultShaderClass, metalAsteroidShaderClass, RingShaderClass, TerrainShaderClass, CockpitShaderClass, CockpitScreenShaderClass, SkyboxShaderClass};
