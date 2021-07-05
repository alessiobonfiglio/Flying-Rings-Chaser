import {default as WebGlManager} from "./source/webgl-manager.js"
import {default as GameEngine} from "./source/engine.js"
import {default as Spaceship} from "./source/gameObjects/spaceship.js"
import {default as utils} from "./source/utils.js"


async function setupGlObjects(glManager, gl) {
	const info =
		[
			[Spaceship, "Spaceship"]
		];

	for (const [objClass, className] of info) {
		const objFileName = objClass.sourceFile;
		const objModel = new OBJ.Mesh(await utils.get_objstr(objFileName));
		const textureFileName = objClass.textureFile;
		const texture = utils.getTextureFromImage(gl, await utils.loadImage(textureFileName));
		glManager.bindGlModel(objModel, texture, className);
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
	const shaderDir = baseDir + "shaders/";

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

	// load the shader files
	const shaderText = await utils.loadFilesAsync([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl']);
	const vertexShaderSource = shaderText[0];
	const fragmentShaderSource = shaderText[1];

	// create and initialize the WebGL manager
	const webGlManager = new WebGlManager(gl, vertexShaderSource, fragmentShaderSource);
	webGlManager.initialize();
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
