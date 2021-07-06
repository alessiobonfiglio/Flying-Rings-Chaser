import {default as WebGlManager} from "./source/webgl-manager.js"
import {default as GameEngine} from "./source/engine.js"
import {default as Cube} from "./source/gameObjects/cube.js"
import {default as Spaceship} from "./source/gameObjects/spaceship.js"
import {default as utils} from "./source/utils.js"
import {DefaultShaderClass, RingShaderClass} from "./shaders/shaderClasses.js";
import {default as Asteroid} from "./source/gameObjects/asteroid.js";
import {default as Ring} from "./source/gameObjects/ring.js";


async function setupGlObjects(glManager, gl) {
	const info =
		[
			[Cube, "Cube"],
			[Spaceship, "Spaceship"],
			[Asteroid, "Asteroid"],
			[Ring, "Ring"]
		];

	for (const [objClass, className] of info) {
		// load the obj file
		const objModel = new OBJ.Mesh(await utils.get_objstr(objClass.objFilename));
		// load the texture
		let texture;
		if(objClass.textureFilename == null){
			texture = null;
		} else {
			texture = utils.getTextureFromImage(gl, await utils.loadImage(objClass.textureFilename));
		}

		glManager.bindGlModel(objModel, texture, objClass.shaderClass, className);
	}
}

async function setupGlShaders(glManager, gl) {
	const info =
		[
			DefaultShaderClass,
			RingShaderClass
		];

	for (const shaderClass of info) {
		// load the shader files
		const shaderText = await utils.loadFilesAsync([shaderClass.vertexShaderFilename, shaderClass.fragmentShaderFilename]);
		const vertexShaderSource = shaderText[0];
		const fragmentShaderSource = shaderText[1];

		glManager.bindGLShader(shaderClass, vertexShaderSource, fragmentShaderSource);
	}
}

function logGLCall(functionName, args) {
	console.log("gl." + functionName + "(" +
		WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
}

async function init() {

	const path = window.location.pathname;
	const page = path.split("/").pop();
	const baseDir = window.location.href.replace(page, '');

	// Get A WebGL context
	const canvas = document.getElementById("c");
	const gl = canvas.getContext("webgl2");
	if (!gl) {
		document.write("GL context not opened");
		return;
	}

	// de-comment to enable webgl debug (just print errors)
	//gl = WebGLDebugUtils.makeDebugContext(gl);
	// de-comment to enable webgl debug (with verbose logging of every function call)
	//gl = WebGLDebugUtils.makeDebugContext(gl, undefined, logGLCall);

	// create the setting of the game
	const gameSetting = {
		maxHalfX: 100,
		maxHalfY: 50,
		maxZ: 500,
		fpsLimit: 60,
		gameSpeed: 1,
		numberOfAsteroids: 20,
		asteroidScaleRange: [0.1, 0.1],
		asteroidSpeedRange: [20, 40],
		asteroidRotationSpeedRange: [0, 30],
	} //maybe load this from a json in the future?

	// create and initialize the WebGL manager
	const webGlManager = new WebGlManager(gl, gameSetting);
	webGlManager.initialize();
	await setupGlShaders(webGlManager, gl);
	await setupGlObjects(webGlManager, gl);

	// create and start the game engine
	const gameEngine = new GameEngine(webGlManager, window, gameSetting);
	gameEngine.setup();
}

window.onload = init;
