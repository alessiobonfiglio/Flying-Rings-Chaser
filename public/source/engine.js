import {default as Cube} from "./gameObjects/cube.js";
import {default as Spaceship} from "./gameObjects/spaceship.js";
import {default as Camera} from "./gameObjects/camera.js";
import {default as Asteroid} from "./gameObjects/asteroid.js";

class GameEngine {
	#webGlManager;
	#window;

	#gameConfig;

	#frameCount;

	// used for the fps limit
	#then;
	#frameInterval;

	//used for passing the loop callback
	#wrapperCallback;

	// game objects
	#spaceship;
	#cubes = [];
	#asteroids = [];

	constructor(webGlManager, window, gameConfig) {
		this.#webGlManager = webGlManager;
		this.#window = window;
		this.#gameConfig = gameConfig;

		this.#frameInterval = 1000.0 / gameConfig.fpsLimit;
		this.#frameCount = 0;
	}

	setup() {
		this.#webGlManager.camera = new Camera([0, 0, 0], 0, -180);

		// initialize the spaceship object
		this.#spaceship = new Spaceship();
		this.#spaceship.position = [-9, 0, 5];
		this.#webGlManager.instantiate(this.#spaceship);

		this.#createAsteroids();

		this.#cubes[0] = new Cube();
		this.#cubes[0].position = [0, -7, 10];
		this.#webGlManager.instantiate(this.#cubes[0]);
		//this.#cubes[1] = new Cube();
		//this.#webGlManager.instantiate(this.#cubes[1]);

		// must be done like this to keep a reference of 'this'
		this.#wrapperCallback = function () {
			const engine = this;
			engine.frameLoop();
		}.bind(this);

		this.#then = Date.now();
		this.frameLoop();
	}

	#gameLoop() {

		// do things here

		this.#moveAsteroids();
		this.#spaceship.orientation[0] += 0.5;
		this.#spaceship.orientation[1] += 1.0;
		this.#spaceship.orientation[2] += 1.5;

		//this.#webGlManager.camera.verticalAngle++;
		//console.log(this.#webGlManager.camera.verticalAngle%360);


		this.#webGlManager.draw();
	}

	// this is done in order to limit the framerate to 'fpsLimit'
	frameLoop() {
		this.#window.requestAnimationFrame(this.#wrapperCallback);

		const now = Date.now();
		const delta = now - this.#then;

		if (delta > this.#frameInterval) {

			// Just `then = now` is not enough.
			// Lets say we set fps at 10 which means
			// each frame must take 100ms
			// Now frame executes in 16ms (60fps) so
			// the loop iterates 7 times (16*7 = 112ms) until
			// delta > interval === true
			// Eventually this lowers down the FPS as
			// 112*10 = 1120ms (NOT 1000ms).
			// So we have to get rid of that extra 12ms
			// by subtracting delta (112) % interval (100).
			// Hope that makes sense.
			this.#then = now - (delta % this.#frameInterval);

			this.#frameCount++;
			this.#gameLoop();
		}
	}

	#createAsteroids() {
		for (let i = 0; i < this.#gameConfig.numberOfAsteroids; i++) {
			const ast = new Asteroid();

			ast.initialize(this.#gameConfig);

			this.#webGlManager.instantiate(ast);
			this.#asteroids.push(ast);
		}
	}

	#moveAsteroids() {
		for (const i of this.#asteroids) {
			i.moveForward(this.#gameConfig);
		}
	}

}

export default GameEngine;