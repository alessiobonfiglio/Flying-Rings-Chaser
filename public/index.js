import {default as WebGlManager} from "./source/webgl-manager.js"
import {default as GameEngine} from "./source/engine.js"
import {default as Cube} from "./source/gameObjects/cube.js"
import {default as Spaceship} from "./source/gameObjects/spaceship.js"
import {default as utils} from "./source/utils.js"
import {
	CockpitScreenShaderClass,
	CockpitShaderClass,
	DefaultShaderClass,
	RingShaderClass,
	SkyboxShaderClass,
	TerrainShaderClass
} from "./shaders/shaderClasses.js";
import {default as Asteroid} from "./source/gameObjects/asteroid.js";
import {default as Ring} from "./source/gameObjects/ring.js";
import {default as Laser} from "./source/gameObjects/laser.js";
import {default as Terrain} from "./source/gameObjects/terrain.js";
import {default as Cockpit} from "./source/gameObjects/cockpit.js";
import {default as CockpitScreen} from "./source/gameObjects/cockpitScreen.js";
import {default as Skybox} from "./source/skybox.js";
import Explosion from "./source/gameObjects/explosion.js"


async function setupGlObjects(glManager, gl, gameSettings) {
	const classes =
		[
			Cube,
			Spaceship,
			Cockpit,
			CockpitScreen,
			Asteroid,
			Ring,
			Laser,
			Terrain,
			Explosion
		];

	for (const objClass of classes) {
		// load the obj file
		const objModel = objClass.meshGenerator
			? objClass.meshGenerator(gameSettings)
			: new OBJ.Mesh(await utils.get_objstr(objClass.objFilename));

		// load the texture
		const texture = objClass.textureFilename != null
			? utils.getTextureFromImage(gl, await utils.loadImage(objClass.textureFilename))
			: null;
		if (objClass.loadInfoFromObjModel)
			objClass.loadInfoFromObjModel(objModel);

		glManager.bindGlModel(objModel, texture, objClass.shaderClass, objClass.name);
	}
}

async function setupGlShaders(glManager) {
	const info =
		[
			DefaultShaderClass,
			RingShaderClass,
			TerrainShaderClass,
			CockpitShaderClass,
			CockpitScreenShaderClass
		];

	for (const shaderClass of info) {
		// load the shader files
		const shaderText = await utils.loadFilesAsync([shaderClass.vertexShaderFilename, shaderClass.fragmentShaderFilename]);
		const vertexShaderSource = shaderText[0];
		const fragmentShaderSource = shaderText[1];

		glManager.bindGLShader(shaderClass, vertexShaderSource, fragmentShaderSource);
	}
}

async function setupGlSkybox(glManager, gl) {
	const shaderText = await utils.loadFilesAsync([SkyboxShaderClass.vertexShaderFilename, SkyboxShaderClass.fragmentShaderFilename]);
	const vertexShaderSource = shaderText[0];
	const fragmentShaderSource = shaderText[1];
	glManager.bindGLShader(SkyboxShaderClass, vertexShaderSource, fragmentShaderSource);

	const skyboxVertices = new Float32Array(
		[
			-1, -1, 1.0,
			1, -1, 1.0,
			-1, 1, 1.0,
			-1, 1, 1.0,
			1, -1, 1.0,
			1, 1, 1.0,
		]);
	const skyboxTexture = gl.createTexture();
	const faceInfos = Skybox.getFaceInfos(gl);
	for (const faceInfo of faceInfos) {
		faceInfo.image = await utils.loadImage(faceInfo.url)
	}
	utils.fillSkyboxTextureFromImage(gl, skyboxTexture, faceInfos);

	glManager.createSkybox(skyboxVertices, skyboxTexture);
}

function logGLCall(functionName, args) {
	console.log("gl." + functionName + "(" +
		WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
}

async function init() {
	// Get A WebGL context
	const canvas = document.getElementById("webglCanvas");
	const gl = canvas.getContext("webgl2");
	if (!gl) {
		document.write("GL context not opened");
		return;
	}

	// Do not open context menu on right mouse click
	window.oncontextmenu = () => false;

	// de-comment to enable webgl debug (just print errors)
	//gl = WebGLDebugUtils.makeDebugContext(gl);
	// de-comment to enable webgl debug (with verbose logging of every function call)
	//gl = WebGLDebugUtils.makeDebugContext(gl, undefined, logGLCall);

	// create the setting of the game
	const gameSetting = {
		// Game engine
		maxHalfX: 100,
		maxHalfY: 50,
		maxZ: 500,
		fpsLimit: 60,
		gameSpeed: 1,

		// Cockpit
		cockpitSpeed: 80,
		cockpitBoostSpeed: 200,
		pointsPerSecond: 50,
		damagePerSecond: 1,
		cockpitScreenAnimationSpeed: 3,

		// Asteroids
		numberOfAsteroids: 20,
		asteroidScaleRange: [0.1, 0.1],
		asteroidSpeedRange: [20, 40],
		asteroidRotationSpeedRange: [0, 30],
		asteroidPoints: 100,
		asteroidDamage: 10,
		asteroidHealth: 2,

		// Rings
		numberOfRings: 15,
		minRingDistance: 35,
		ringScaleRange: [12, 12],
		ringSpeedRange: [20, 20],
		ringPoints: 1000,
		ringRestoreHealth: 25,

		// Lasers
		maxLasers: 10,
		laserSpeed: 150,
		laserReloadTime: 1,
		laserCooldown: 0.5,

		// Terrain
		terrainChunkSize: 500,
		terrainChunkResolution: 32,
		halfNumberTerrainChunksColumns: 2,
		numberTerrainChunksRows: 3,
		terrainSpeed: 60,
		terrainDamage: 5,
		terrainPoints: 100,

		// Skybox
		skyboxDefaultPosition: [0, -200, 0],
		skyboxOscillatingSpeed: 0.6,
		skyboxTwoTimesMaxOscillation: 10,
		skyboxParallaxFactor: 0.5, // between 1 and 0 (1->disabled)

		get deltaT() {
			return this.gameSpeed / this.fpsLimit;
		}
	} //maybe load this from a json in the future?

	// create and initialize the WebGL manager
	const webGlManager = new WebGlManager(gl, gameSetting);
	webGlManager.initialize();
	await setupGlShaders(webGlManager);
	await setupGlObjects(webGlManager, gl, gameSetting);
	await setupGlSkybox(webGlManager, gl);

	// create and start the game engine
	const gameEngine = new GameEngine(webGlManager, window, gameSetting);
	gameEngine.setup();
}

window.onload = init;
