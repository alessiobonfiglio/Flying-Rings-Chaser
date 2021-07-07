import { default as Cube } from "./gameObjects/cube.js";
import { default as Spaceship } from "./gameObjects/spaceship.js";
import { default as Camera } from "./gameObjects/camera.js";
import { default as Asteroid } from "./gameObjects/asteroid.js";
import { default as Ring } from "./gameObjects/ring.js";
import { default as Light } from "./light.js";
import { default as Terrain } from "./gameObjects/terrain.js";
import { default as Cockpit } from "./gameObjects/cockpit.js";
import { default as TerrainCollider } from "./gameObjects/terrainCollider.js";
import { default as MathUtils } from "./math_utils.js"
import GameObject from "./gameObjects/gameObject.js";
import { default as SemispaceCollider } from "./colliders/semispaceCollider.js"

var X = 0, Y = 0, Z = 0, A = 180;

class GameEngine {
	#webGlManager;
	#window;

	#gameSettings;

	#frameCount;

	// used for the fps limit
	#then;
	#frameInterval;

	//used for passing the loop callback
	#wrapperCallback;

	// game objects
	#spaceship;
	#cockpit;
	#terrains = [];
	#cubes = [];
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
		this.#webGlManager.camera = new Camera([0, 0, 0], 0, -180);

		// initialize the spaceship object
		this.#spaceship = new Spaceship();
		this.#spaceship.center = [0, 1, 4];

		this.#instantiate(this.#spaceship);
		this.#createTerrainChunks();
		
		this.#cockpit = new Cockpit(this.#window, this.#gameSettings);
		this.#terrainCollider = this.#instantiateTerrainCollider();
		this.#instantiate(this.#cockpit);

		this.#webGlManager.camera.initialize(this.#cockpit);

		this.#createAsteroids();

		this.#webGlManager.setAndEnableLight(0, new Light([0, 0, 0]));

		for (const ring of this.getSomeRings([0, 1, 4], 100)) {
			this.#rings.push(ring);
			this.#instantiateRing(ring);
		}

		this.#cubes[0] = new Cube();
		this.#cubes[0].position = [0, -7, 10];
		this.#instantiate(this.#cubes[0]);
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

		this.#updateGameObjects();

		//this.#webGlManager.camera.verticalAngle++;
		// this.#webGlManager.camera.verticalAngle = A;
		// this.#webGlManager.camera.position = [X, 0, Z];
		//console.log(this.#webGlManager.camera.verticalAngle%360);
		this.#checkCollisions();
		this.#webGlManager.draw();
	}

	#checkCollisions() {
		// rings
		for (const ring of this.#rings) {
			if (this.#spaceship.collider.intersectWithCircle(ring.collider)) {
				this.#spaceship.onRingCollided(ring);
				ring.onSpaceshipCollided(this.#spaceship);
			}
			if (this.#cockpit.collider.intersectWithCircle(ring.collider)) {
				this.#cockpit.onRingCollided(ring);
				ring.onSpaceshipCollided(this.#cockpit);
			}
		}

		// asteroid
		for (const asteroid of this.#asteroids) {
			if (this.#spaceship.collider.intersectWithSphere(asteroid.collider)) {
				this.#spaceship.onAsteroidCollided(asteroid);
				asteroid.onSpaceshipCollided(this.#spaceship);
			}
			if (this.#cockpit.collider.intersectWithSphere(asteroid.collider)) {
				this.#cockpit.onAsteroidCollided(asteroid);
				asteroid.onSpaceshipCollided(this.#cockpit);
			}
		}

		// ground
		if(this.#terrainCollider.collider.intersectWithSphere(this.#cockpit.collider)){
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

	#createAsteroids() {
		for (let i = 0; i < this.#gameSettings.numberOfAsteroids; i++) {
			const ast = new Asteroid();

			ast.initialize(this.#gameSettings);

			this.#instantiateAsteroid(ast);
			this.#asteroids.push(ast);
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
		let gameObjectList = [this.#asteroids, this.#rings, this.#cubes, [this.#spaceship], [this.#cockpit], this.#terrains].flat();
		for (let gameObject of gameObjectList) {
			if (gameObject.update) {
				gameObject.update();
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


	* getSomeRings(center, tot) {
		var v = [0, 0, 1];
		var spacing = 40;
		for (var i = 0; i < tot; i++) {
			let ring = new Ring();
			ring.center = MathUtils.sum(center, MathUtils.mul((i - tot / 2) * spacing, v));
			yield ring;
		}
	}

	#removeItem(arr, value) {
		var index = arr.indexOf(value);
		if (index > -1) {
			arr.splice(index, 1);
		}
		return arr;
	}

	#instantiateTerrainCollider() {
		var terrain = new TerrainCollider();
		terrain.initialize(this.#cockpit, this.#gameSettings);
		this.#instantiate(terrain);
		return terrain;
	}
}

export default GameEngine;
