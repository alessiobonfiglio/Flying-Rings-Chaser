import {default as Camera} from "./gameObjects/camera.js";
import {default as Asteroid} from "./gameObjects/asteroid.js";
import {default as Ring} from "./gameObjects/ring.js";
import {default as Terrain} from "./gameObjects/terrain.js";
import {default as Cockpit} from "./gameObjects/cockpit.js";
import {default as TerrainCollider} from "./gameObjects/terrainCollider.js";
import Skybox from "./skybox.js";

class GameEngine {
	#webGlManager;
	#window;

	#gameSettings;
	static isPlaying = false;

	#frameCount;

	// used for the fps limit
	#then;
	#frameInterval;

	//used for passing the loop callback
	#wrapperCallback;

	// game objects
	#cockpit;
	#terrains = [];
	#asteroids = [];
	#rings = [];
	#terrainCollider;

	constructor(webGlManager, window, gameSettings) {
		this.#webGlManager = webGlManager;
		this.#window = window;
		this.#gameSettings = gameSettings;

		this.#frameInterval = 1000.0 / gameSettings.fpsLimit;
		this.#frameCount = 0;
	}

	setup() {
		document.getElementById("start-button").onclick = this.#start_game(this);
		document.getElementById("end-button").onclick = this.#end_game(this);
		this.#webGlManager.camera = new Camera([0, 0, 0], 0, -180);

		this.#webGlManager.skyboxGameObject = new Skybox(this.#gameSettings);

		// Initialize the terrain and the cockpit
		this.#createTerrainChunks();
		this.#cockpit = new Cockpit(this.#window, this.#gameSettings);
		this.#cockpit.initialize();
		this.#terrainCollider = this.#instantiateTerrainCollider();

		this.#instantiate(this.#cockpit);
		this.#webGlManager.camera.initialize(this.#cockpit);

		// must be done like this to keep a reference of 'this'
		this.#wrapperCallback = function () {
			const engine = this;
			engine.frameLoop();
		}.bind(this);

		this.#then = Date.now();
		this.frameLoop();
	}

	#start_game(gameEngine) {
		return function() {
			GameEngine.isPlaying = true;
			document.getElementById("start-game").style.zIndex = -1;
			document.getElementById("start-button").disabled = true;
			gameEngine.createAsteroids();
			gameEngine.createRings();
		}
	}

	#end_game(gameEngine) {
		return function() {
			GameEngine.isPlaying = true;
			document.getElementById("end-game").style.zIndex = -1;
			document.getElementById("end-button").disabled = true;
			gameEngine.restartGame();
		}
	}
	
	restartGame() {
		this.#cockpit.initialize();
		for (const ast of this.#asteroids)
			ast.initialize(this.#gameSettings);
		Ring.lastRing = this.#rings[0];
		Ring.lastRing.position = [0, 0, this.#gameSettings.maxZ / 3];
		for (const ring of this.#rings)
			ring.initialize(this.#gameSettings);
	}

	#gameLoop() {
		// do things here
		this.#updateGameObjects();

		//this.#webGlManager.camera.verticalAngle++;
		//console.log(this.#webGlManager.camera.verticalAngle%360);
		this.#checkCollisions();
		this.#updateLights();
		this.#webGlManager.draw();

		// If the player is dead end the game
		if (this.#cockpit.isDead()) {
			GameEngine.isPlaying = false;
			this.#cockpit.scale = 0;
			document.getElementById("end-score").textContent = "You scored " + (this.#cockpit.getScore()) + " points";
			document.getElementById("end-game").style.zIndex = 1;
			document.getElementById("end-game").style.opacity = 1;
			document.getElementById("end-button").disabled = false;
		}
	}

	#checkCollisions() {
		// rings
		for (const ring of this.#rings) {
			if (this.#cockpit.collider.intersectWithCircle(ring.collider)) {
				this.#cockpit.onRingCollided(ring);
				ring.onSpaceshipCollided(this.#cockpit);
			}
		}

		// asteroid
		for (const asteroid of this.#asteroids) {
			if (this.#cockpit.collider.intersectWithSphere(asteroid.collider)) {
				this.#cockpit.onAsteroidCollided(asteroid);
				asteroid.onSpaceshipCollided(this.#cockpit);
			}
		}

		// ground
		if (this.#terrainCollider.collider.intersectWithSphere(this.#cockpit.collider)) {
			this.#cockpit.onGroundCollided();
		}
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

	createAsteroids() {
		for (let i = 0; i < this.#gameSettings.numberOfAsteroids; i++) {
			const ast = new Asteroid();
			ast.initialize(this.#gameSettings);

			this.#instantiateAsteroid(ast);
			this.#asteroids.push(ast);
		}
	}

	createRings() {
		// Manually set the first ring as the last instantiated ring, in order 
		// to compute the minimum distance between rings
		const r = new Ring();

		Ring.lastRing = r;
		r.position = [0, 0, this.#gameSettings.maxZ / 3];

		r.initialize(this.#gameSettings);

		this.#instantiateRing(r);
		this.#rings.push(r);

		// Instantiate the other rings
		for (let i = 1; i < this.#gameSettings.numberOfRings; i++) {
			const ring = new Ring();
			ring.initialize(this.#gameSettings);

			this.#instantiateRing(ring);
			this.#rings.push(ring);
		}
	}

	#createTerrainChunks() {
		for (let i = -this.#gameSettings.halfNumberTerrainChunksColumns; i < this.#gameSettings.halfNumberTerrainChunksColumns; i++) {
			for (let j = 0; j < this.#gameSettings.numberTerrainChunksRows; j++) {
				const terr = new Terrain(this.#gameSettings);

				terr.position = [i * this.#gameSettings.terrainChunkSize, 0, j * this.#gameSettings.terrainChunkSize];
				terr.rowNumber = j;

				this.#webGlManager.instantiate(terr);
				this.#terrains.push(terr);
			}
		}
	}

	#updateGameObjects() {
		let gameObjectList = [this.#asteroids, this.#rings, [this.#cockpit], this.#terrains, [this.#webGlManager.skyboxGameObject]].flat();
		for (let gameObject of gameObjectList) {
			if (gameObject.update) {
				gameObject.update(this.#frameCount);
			}
		}
		this.#webGlManager.camera.update();
		this.#terrainCollider.update();
	}

	#instantiate(gameObject) {
		gameObject.destroyed.subscribe(gameObj => this.#webGlManager.destroy(gameObj));
		this.#webGlManager.instantiate(gameObject);
		return gameObject;
	}

	#instantiateRing(ring) {
		this.#instantiate(ring);
		ring.destroyed.subscribe(r => this.#removeItem(this.#rings, r));
		return ring;
	}

	#instantiateAsteroid(asteroid) {
		this.#instantiate(asteroid);
		asteroid.destroyed.subscribe(ast => this.#removeItem(this.#asteroids, ast));
		return asteroid;
	}

	#updateLights(){
		this.#webGlManager.setAndEnableLightPosition(0, this.#cockpit.position);

		//todo: lasers
	}

	#removeItem(arr, value) {
		const index = arr.indexOf(value);
		if (index > -1) {
			arr.splice(index, 1);
		}
		return arr;
	}

	#instantiateTerrainCollider() {
		const terrain = new TerrainCollider();
		terrain.initialize(this.#cockpit, this.#gameSettings);
		this.#instantiate(terrain);
		return terrain;
	}
}


export default GameEngine;
