import {default as Spaceship} from "./gameObjects/spaceship.js";
import {default as Camera} from "./gameObjects/camera.js";

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

	constructor(webGlManager, window, gameConfig) {
		this.#webGlManager = webGlManager;
		this.#window = window;
		this.#gameConfig = gameConfig;

		this.#frameInterval = 1000.0 / gameConfig.fpsLimit;
        this.#frameCount = 0;
	}

	setup() {
		this.#webGlManager.camera = this.#buildCamera();

		// initialize the spaceship object
		this.#spaceship = new Spaceship();
		this.#spaceship.position = [-2, 0, 5];
		this.#webGlManager.instantiate(this.#spaceship);


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

	#buildCamera() {
		const camera = new Camera();
		camera.position = [3.0, 3.0, 5];
		camera.horizontalAngle = -45.0;
		camera.verticalAngle = -40.0;

		return camera;
	}

}

export default GameEngine;