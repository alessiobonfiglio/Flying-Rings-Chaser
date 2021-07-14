import {default as Camera} from "./gameObjects/camera.js";
import {default as BrownAsteroid} from "./gameObjects/brownAsteroid.js";
import {default as GreyAsteroid} from "./gameObjects/greyAsteroid.js";
import {default as MetalAsteroid} from "./gameObjects/metalAsteroid.js";
import {default as Ring} from "./gameObjects/ring.js";
import {default as Laser} from "./gameObjects/laser.js";
import {default as Terrain} from "./gameObjects/terrain.js";
import {default as Explosion} from "./gameObjects/explosion.js";
import {default as Cockpit} from "./gameObjects/cockpit.js";
import {default as TerrainCollider} from "./gameObjects/terrainCollider.js";
import {default as Skybox} from "./skybox.js";
import {default as CockpitScreen} from "./gameObjects/cockpitScreen.js";
import Square from "./gameObjects/square.js";
import Animations from "./utils/animations.js";
import GameObject from "./gameObjects/gameObject.js";

class GameEngine {
	static isPlaying = false;
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
	#cockpit;
	#cockpitScreen;
	#terrains = [];
	#asteroids = [];
	#backgroundAsteroids = [];
	#rings = [];
	#lasers = [];
	#terrainCollider;
	#explosions = [];

	#boostFactor = 1.0;

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
		GameObject.instantiateInEngine = gameObject =>
		{
			console.log("instatiating ", gameObject)
			this.#instantiate(gameObject);
		} 

		this.#webGlManager.camera = new Camera([0, 0, 0], 0, -180);

		this.#webGlManager.skyboxGameObject = new Skybox(this.#gameSettings);

		// Initialize the lasers, the terrain and the cockpit
		this.#createLasers();
		this.#createTerrainChunks();
		this.#createCockpit();
		
		this.#cockpitScreen = new CockpitScreen(this.#gameSettings, this.#cockpit);
		this.#terrainCollider = this.#instantiateTerrainCollider();
		this.#instantiate(this.#cockpitScreen);
		this.#webGlManager.camera.initialize(this.#cockpit);
		this.#createBackgroundAsteroids();

		// must be done like this to keep a reference of 'this'
		this.#wrapperCallback = function () {
			const engine = this;
			engine.frameLoop();
		}.bind(this);

		this.#then = Date.now();
		this.frameLoop();
	}

	#start_game(gameEngine) {
		return function () {
			GameEngine.isPlaying = true;
			document.getElementById("start-game").style.zIndex = -1;
			document.getElementById("start-button").disabled = true;
			gameEngine.createAsteroids();
			gameEngine.createRings();
		}
	}

	#end_game(gameEngine) {
		return function () {
			GameEngine.isPlaying = true;
			document.getElementById("end-game").style.zIndex = -1;
			document.getElementById("end-button").disabled = true;
			gameEngine.restartGame();
		}
	}

	restartGame() {
		this.#cockpit.initialize();
		this.#cockpit.isVisible = true;
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
			this.#cockpit.isVisible = false;
			document.getElementById("end-score").textContent = "You scored " + (this.#cockpit.getScore()) + " points";
			document.getElementById("end-game").style.zIndex = 1;
			document.getElementById("end-game").style.opacity = 1;
			document.getElementById("end-button").disabled = false;
		}
	}

	#checkCollisions() {
		if (!GameEngine.isPlaying)
			return;

		// rings
		for (const ring of this.#rings) {
			if (this.#cockpit.collider.intersectWithCircle(ring.collider)) {
				this.#cockpit.onRingCollided(ring);
				ring.onSpaceshipCollided(this.#cockpit);
			}
		}

		// asteroids
		for (const asteroid of this.#asteroids) {
			if (this.#cockpit.collider.intersectWithSphere(asteroid.collider)) {
				this.#cockpit.onAsteroidCollided(asteroid);
				asteroid.onSpaceshipCollided(this.#cockpit);
			}
			// lasers
			for (const laser of this.#lasers) {
				if (laser.isVisible && laser.collider.intersectWithSphere(asteroid.collider)) {
					this.#cockpit.onLaserCollided(laser);
					laser.onAsteroidCollided(asteroid);
					asteroid.onLaserCollided(laser);
				}
			}
		}

		// ground
		if (this.#terrainCollider.collider.intersectWithSphere(this.#cockpit.collider)) {
			this.#cockpit.onGroundCollided();
		}
	}

	// this is done in order to limit the framerate to 'fpsLimit'
	#nextFramePromiseResolve = () => ({});

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
			this.#NextFramePromiseHandler();
		}
	}


	//
	// GameObjects' creation
	//

	#createCockpit() {
		this.#cockpit = new Cockpit(this.#window, this.#gameSettings, this.#lasers);

		const speedUpTime = this.#gameSettings.boostDuration / 5.0;
		const maintainingTime = this.#gameSettings.boostDuration;
		const slowDownTime = this.#gameSettings.boostDuration / 4.0;
		const totBoostTime = speedUpTime + maintainingTime + slowDownTime;
		this.#cockpit.ringHit.subscribe(_ => this.#webGlManager.camera.boost(speedUpTime, maintainingTime, slowDownTime));
		this.#cockpit.ringHit.subscribe(_ => this.activateSpeedBoost(totBoostTime));
		this.#cockpit.asteroidHit.subscribe(_ => this.#webGlManager.camera.tilt());

		this.#cockpit.initialize();
		this.#instantiate(this.#cockpit);
	}

	async activateSpeedBoost(time) {
		this.#boostFactor = this.#gameSettings.boostFactor;
		await Animations.delay(time);
		this.#boostFactor = 1.0;
	}

	createAsteroids() {
		for (let i = 0; i < this.#gameSettings.numberOfAsteroids; i++) {
			const ast = this.#getAsteroid(i);
			ast.initialize(this.#gameSettings);

			this.#instantiateAsteroid(ast);
			this.#asteroids.push(ast);
		}
	}

	#createBackgroundAsteroids() {
		for (let i = 0; i < this.#gameSettings.numberOfBackgroundAsteroids; i++) {
			const ast = this.#getAsteroid(i, true);
			ast.initialize(this.#gameSettings);

			this.#instantiateAsteroid(ast, true);
			this.#backgroundAsteroids.push(ast);
		}
	}

	#getAsteroid(index, isBackground = false) {
		switch (index % 3) {
			case 0:
				return new BrownAsteroid(isBackground);
			case 1:
				return new GreyAsteroid(isBackground);
			default:
				return new MetalAsteroid(isBackground);
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

	#createLasers() {
		for (let i = 0; i < this.#webGlManager.maxNumOfLights - 1; i++) {
			const laser = new Laser();
			laser.initialize(this.#gameSettings);

			this.#instantiate(laser);
			this.#lasers.push(laser);
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
		// cockpitScreen must be after cockpit
		const gameObjectList = [this.#asteroids, this.#backgroundAsteroids, this.#rings, this.#lasers,
			[this.#cockpit], [this.#cockpitScreen], this.#terrains, [this.#webGlManager.skyboxGameObject], this.#explosions].flat();
		for (const gameObject of gameObjectList) {
			if (gameObject.update) {
				gameObject.update(this.#frameCount, this.#boostFactor);
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

	#instantiateAsteroid(asteroid, isBackground = false) {
		this.#instantiate(asteroid);
		if (isBackground)
			asteroid.destroyed.subscribe(ast => this.#removeItem(this.#backgroundAsteroids, ast));
		else
			asteroid.destroyed.subscribe(ast => this.#removeItem(this.#asteroids, ast));
		asteroid.death.subscribe((ast, laser) => this.#createExplosion(ast, laser));
		return asteroid;
	}

	async #createExplosion(asteroid, laser) {
		console.log(laser)
		const explosion = new Explosion(this.#gameSettings);
		explosion.velocity = [0, 0, -asteroid.speed];
		explosion.center = asteroid.center;
		explosion.destroyed.subscribe(exp => this.#removeItem(this.#explosions, exp))
		this.#explosions.push(explosion);
		this.#instantiate(explosion);
		await explosion.explode(asteroid, laser.center);
	}

	#instantiateTerrainCollider() {
		const terrain = new TerrainCollider();
		terrain.initialize(this.#cockpit, this.#gameSettings);
		this.#instantiate(terrain);
		return terrain;
	}


	#updateLights() {
		this.#webGlManager.setAndEnableLightPosition(0, this.#cockpit.position);
		for (let i = 0; i < this.#lasers.length; i++) {
			if (this.#lasers[i].isVisible) {
				this.#webGlManager.setAndEnableLightPosition(i + 1, this.#lasers[i].position);
			} else {
				this.#webGlManager.disableLight(i + 1);
			}
		}
	}

	#removeItem(arr, value) {
		const index = arr.indexOf(value);
		if (index > -1) {
			arr.splice(index, 1);
		}
		return arr;
	}


	#NextFramePromiseHandler() {
		this.#nextFramePromiseResolve(this.#gameSettings.deltaT);
		Animations.nextFramePromise = new Promise((resolve, _) => {
			this.#nextFramePromiseResolve = resolve;
		});
	}

}

export default GameEngine;
