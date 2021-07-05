import {default as WebGlManager} from "./source/webgl-manager.js"
import {default as GameEngine} from "./source/engine.js"
import {default as Cube} from "./source/gameObjects/cube.js"
import {default as Spaceship} from "./source/gameObjects/spaceship.js"
import {default as utils} from "./source/utils.js"
import DefaultShaderClass from "./shaders/shaderClasses.js";


async function setupGlObjects(glManager, gl) {
	const info =
		[
			[Cube, "Cube"],
			[Spaceship, "Spaceship"]
		];

	for (const [objClass, className] of info) {
		// load the obj file
		const objModel = new OBJ.Mesh(await utils.get_objstr(objClass.objFilename));
		// load the texture
		const texture = utils.getTextureFromImage(gl, await utils.loadImage(objClass.textureFilename));

		glManager.bindGlModel(objModel, texture, objClass.shaderClass, className);
	}
}

async function setupGlShaders(glManager, gl) {
	const info =
		[
			DefaultShaderClass
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

	// create and initialize the WebGL manager
	const webGlManager = new WebGlManager(gl);
	webGlManager.initialize();
	await setupGlShaders(webGlManager, gl);
	await setupGlObjects(webGlManager, gl);

	// create the setting of the game
	const gameSetting = {
		maxHalfX: 100,
		maxHalfY: 50,
		maxZ: 500,
		fpsLimit: 60,
		gameSpeed: 1,
		numberOfAsteroids: 20,
		asteroidScaleRange: [1, 10],
		asteroidSpeedRange: [1, 2],
		asteroidRotationSpeedRange: [1, 2],
	} //maybe load this from a json in the future?

	// create and start the game engine
	const gameEngine = new GameEngine(webGlManager, window, gameSetting);
	gameEngine.setup();
}

window.onload = init;
