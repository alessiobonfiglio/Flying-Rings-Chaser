import { default as utils } from "./utils.js"
import { default as Light } from "./light.js";

class WebGlManager {
	#gl;
	#gameSetting;

	camera;

	#instantiatedObjects = new Map(); // contains a map of gameObject -> GlObject
	#classToGlObjectMap = new Map(); // maps gameObject class -> GlObject

	#classToGLShaderProgramMap = new Map(); // maps shaderClass class -> GLShaderProgram

	#maxNumOfLights = 5;
	#lights;
	#lightsEnabled;

	// Initialization
	constructor(context, gameSetting) {
		this.#gl = context;
		this.#gameSetting = gameSetting;

		this.#lights = Array(this.#maxNumOfLights).fill(new Light([0, 0, 0]));
		this.#lightsEnabled = Array(this.#maxNumOfLights).fill(false);
	}

	initialize() {
		// Deep test
		this.#gl.enable(this.#gl.DEPTH_TEST);
	}

	// Public Methods
	instantiate(gameObject) {
		var glObject = this.#classToGlObjectMap.get(gameObject.constructor.name);
		this.#instantiatedObjects.set(gameObject, glObject);
	}

	destroy(gameObject) {
		this.#instantiatedObjects.delete(gameObject);
	}

	setAndEnableLight(index, light) {
		if (index >= this.#maxNumOfLights) {
			throw new Error();
		}
		this.#lights[index] = light;
		this.#lightsEnabled[index] = true;
	}

	disableLight(index) {
		if (index >= this.#maxNumOfLights) {
			throw new Error();
		}
		this.#lightsEnabled[index] = false;
	}

	draw() {
		var canvas = this.#gl.canvas;

		// canvas full screen
		this.#resizeCanvasToDisplaySize(canvas);

		// Tell WebGL how to convert from clip space to pixels
		this.#gl.viewport(0, 0, canvas.width, canvas.height);

		// Clear the canvas
		this.#gl.clearColor(0, 0, 0, 0);
		this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT);

		this.#drawGameObjects();
	}

	bindGLShader(shaderClass, vertexShaderSource, fragmentShaderSource) {
		const shaderProgram = new GLShaderProgram(this.#gl, vertexShaderSource, fragmentShaderSource, shaderClass.useTexture);
		this.#classToGLShaderProgramMap.set(shaderClass.name, shaderProgram);
	}

	bindGlModel(objModel, texture, shaderClass, className) {
		const shaderProgram = this.#classToGLShaderProgramMap.get(shaderClass.constructor.name);

		// create the glModel for the class
		const glModel = this.#buildGlObject(objModel, texture, shaderProgram);

		// link the class name with its glModel
		this.#classToGlObjectMap.set(className, glModel);
	}


	// Private Methods
	#buildGlObject(objModel, texture, shaderProgram) {
		var vao = this.#gl.createVertexArray();
		this.#gl.bindVertexArray(vao);

		// Setup position buffer
		var positionBuffer = this.#gl.createBuffer();
		this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, positionBuffer);
		this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(objModel.vertices), this.#gl.STATIC_DRAW);
		this.#gl.enableVertexAttribArray(shaderProgram.locations.positionAttributeLocation);
		this.#gl.vertexAttribPointer(shaderProgram.locations.positionAttributeLocation, 3, this.#gl.FLOAT, false, 0, 0);

		// Setup indices
		var indexBuffer = this.#gl.createBuffer();
		this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		this.#gl.bufferData(this.#gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objModel.indices), this.#gl.STATIC_DRAW);

		// Setup normals
		if (objModel.vertexNormals) {
			var normalBuffer = this.#gl.createBuffer();
			this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, normalBuffer);
			this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(objModel.vertexNormals), this.#gl.STATIC_DRAW);
			this.#gl.enableVertexAttribArray(shaderProgram.locations.normalAttributeLocation);
			this.#gl.vertexAttribPointer(shaderProgram.locations.normalAttributeLocation, 3, this.#gl.FLOAT, false, 0, 0);
		}

		// Setup texture coordinates
		if (texture != null) {
			var textureCoordinateBuffer = this.#gl.createBuffer();
			this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, textureCoordinateBuffer);
			this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(objModel.textures), this.#gl.STATIC_DRAW);
			this.#gl.enableVertexAttribArray(shaderProgram.locations.textureAttributeLocation);
			this.#gl.vertexAttribPointer(shaderProgram.locations.textureAttributeLocation, 2, this.#gl.FLOAT, false, 0, 0);
		}

		const ret = new WebGlObject(vao, texture, objModel);
		ret.shaderProgram = shaderProgram;
		return ret;
	}

	#drawGameObjects() {
		const viewMatrix = this.camera?.viewMatrix() ?? utils.MakeView(3.0, 3.0, 2.5, -45.0, -40.0); // default viewMatrix

		const lightsArray = this.#lights.map((x) => x.position).flat();

		// setup transformation matrix from local coordinates to Clip coordinates
		for (const [gameObject, glObject] of this.#instantiatedObjects.entries())
			if (gameObject.isVisible) {
				// Use the program of the glObject
				this.#gl.useProgram(glObject.shaderProgram.program);

				// Use the vao of the glObject
				this.#gl.bindVertexArray(glObject.vao);

				// Computing transformation matrix
				const worldMatrix = gameObject.worldMatrix();
				const WVPMatrix = this.#computeMatrix(worldMatrix, viewMatrix);

				// Passing the matrix as a uniform to the vertex shader
				this.#gl.uniformMatrix4fv(glObject.shaderProgram.locations.positionUniformLocation, this.#gl.FALSE, utils.transposeMatrix(WVPMatrix));
				this.#gl.uniformMatrix4fv(glObject.shaderProgram.locations.normalUniformLocation, this.#gl.FALSE, utils.transposeMatrix(gameObject.worldMatrix()));

			// passing the increment if present
			if (typeof gameObject.rowNumber !== 'undefined') {
				const zOffset = gameObject.rowNumber * this.#gameSetting.terrainChunkSize;
				console.log(zOffset);
				this.#gl.uniform1f(glObject.shaderProgram.locations.incrementLocation, zOffset);
			}

				// GameObject Texture
				if (glObject.shaderProgram.useTexture) {
					this.#gl.activeTexture(this.#gl.TEXTURE0);
					this.#gl.bindTexture(this.#gl.TEXTURE_2D, glObject.texture);
					this.#gl.uniform1i(glObject.shaderProgram.locations.textureUniformLocation, 0);
				}

				// GameObject Color
				this.#gl.uniform3fv(glObject.shaderProgram.locations.materialDiffColorHandle, gameObject.materialColor);

				// camera position
				this.#gl.uniform3fv(glObject.shaderProgram.locations.cameraPositionLocation, this.camera.position);

				// directional lights
				this.#gl.uniform3fv(glObject.shaderProgram.locations.lightsPositionHandle, lightsArray);
				this.#gl.uniform1uiv(glObject.shaderProgram.locations.lightsEnabledHandle, this.#lightsEnabled);

				// Drawing the gameObject
				this.#gl.drawElements(this.#gl.TRIANGLES, glObject.totIndices, this.#gl.UNSIGNED_SHORT, 0);
			}
	}

	#computeMatrix(worldMatrix, viewMatrix) {
		const canvas = this.#gl.canvas;
		const perspectiveMatrix = utils.MakePerspective(90, canvas.width / canvas.height, 0.1, this.#gameSetting.maxZ);
		return utils.multiplyAllMatrices(perspectiveMatrix, viewMatrix, worldMatrix)
	}

	#resizeCanvasToDisplaySize(canvas, multiplier) {
		multiplier = multiplier || 1;
		const width = canvas.clientWidth * multiplier | 0;
		const height = canvas.clientHeight * multiplier | 0;
		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
			return true;
		}
		return false;
	}

}


class WebGlObject {
	vao;
	texture;
	totIndices;

	constructor(vao, texture, objModel) {
		this.vao = vao;
		this.texture = texture;
		this.totIndices = objModel.indices.length;
	}
}

class GLShaderProgram {
	program;
	locations = {};
	useTexture;

	constructor(gl, vertexShaderSource, fragmentShaderSource, useTexture) {
		// Create GLSL shaders, upload the GLSL source, compile the shaders
		const vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
		const fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

		// Link the two shaders into a program and store into the glModel of the class
		this.program = utils.createProgram(gl, vertexShader, fragmentShader);

		this.useTexture = useTexture;

		this.initializeAttributeLocations(gl);
	}

	initializeAttributeLocations(gl) {
		// Look up where the vertex data needs to go.
		this.locations.positionAttributeLocation = gl.getAttribLocation(this.program, "inPosition");
		this.locations.normalAttributeLocation = gl.getAttribLocation(this.program, "inNormal");

		this.locations.cameraPositionLocation = gl.getUniformLocation(this.program, "cameraPosition");

		this.locations.incrementLocation = gl.getUniformLocation(this.program, "zOffset");

		if (this.useTexture) {
			this.locations.textureAttributeLocation = gl.getAttribLocation(this.program, "inTexCoords");
			this.locations.textureUniformLocation = gl.getUniformLocation(this.program, "objectTexture");
		}

		this.locations.positionUniformLocation = gl.getUniformLocation(this.program, "matrix");
		this.locations.normalUniformLocation = gl.getUniformLocation(this.program, "nMatrix");

		this.locations.materialDiffColorHandle = gl.getUniformLocation(this.program, "mDiffColor");

		this.locations.lightsPositionHandle = gl.getUniformLocation(this.program, "lightsPositions");
		this.locations.lightsEnabledHandle = gl.getUniformLocation(this.program, "lxsEnabled");
	}
}

export default WebGlManager;
