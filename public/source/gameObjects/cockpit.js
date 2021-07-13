import { default as GameObject } from "./gameObject.js";
import { CockpitShaderClass } from "../../shaders/shaderClasses.js";
import { default as SphericalCollider } from "../colliders/sphericalCollider.js";
import { default as MathUtils } from "../math_utils.js";
import { default as GameEngine } from "../engine.js";
import { default as Event } from "../utils/event.js"

class Cockpit extends GameObject {	
	static objFilename = "resources/cockpit/cockpit_no_screen.obj";
	static textureFilename = "resources/cockpit/Cockpit_Texture.png";
	static shaderClass = new CockpitShaderClass();
	static #colliderRadius;
	static #centerOfGravity;

	ringHit = new Event();

	#gameSettings;
	#health;
	#healthDisplay;
	#points;
	#pointsDisplay;
	#laserPool;
	#lasers = [];
	#lastLaser;
	#canShoot = true;
	#lastShootingFrame = 0;

	position;
	scale = 2;
	orientation = [0, 180, 0];
	deltaSpeed;
	up = 0;
	down = 0;
	left = 0;
	right = 0;
	isShooting = false;

	// Initialization
	constructor(window, gameSettings, laserObjects) {
		super();
		this.collider = new SphericalCollider();
		this.collider.radius = Cockpit.#colliderRadius;
		this.#gameSettings = gameSettings;
		this.#laserPool = laserObjects;

		this.deltaSpeed = gameSettings.cockpitSpeed;
		this.#healthDisplay = document.getElementById("health");
		this.#pointsDisplay = document.getElementById("points");
		this.#lasers = document.getElementsByClassName("laser");

		window.addEventListener("keydown", this.#keyFunctionDown(this), false);
		window.addEventListener("keyup", this.#keyFunctionUp(this), false);
	}

	// Properties
	get localCenterOfGravity() {
		return Cockpit.#centerOfGravity;
	}

	static loadInfoFromObjModel(objModel) {
		Cockpit.#centerOfGravity = GameObject._computeCenterOfGravity(objModel);
		Cockpit.#colliderRadius = GameObject._computeRadius(objModel, Cockpit.#centerOfGravity);
	}

	initialize() {
		// Reset cockpit
		this.position = [0, 0, 0];
		this.#health = 100;
		this.#points = 0;

		// Reset lasers
		for (const laser of this.#lasers) {
			laser.style.opacity = 1;
		}
		this.#lastLaser = this.#lasers.length - 1;
		this.#canShoot = true;
	}

	update(frameCount) {
		super.update();

		if (!GameEngine.isPlaying)
			return;

		// Adjust collider towards the front of the cockpit
		this.collider.center[2] += 2;

		// Move cockpit
		const horizontal = (this.left - this.right) * this.#gameSettings.deltaT;
		const vertical = (this.up - this.down) * this.#gameSettings.deltaT;
		this.position = MathUtils.sum(this.position, [horizontal, vertical, 0]);

		// Clamp position to borders
		this.position[0] = Math.min(Math.max(this.position[0], -this.#gameSettings.maxHalfX), this.#gameSettings.maxHalfX);
		this.position[1] = Math.min(Math.max(this.position[1], -this.#gameSettings.maxHalfY), this.#gameSettings.maxHalfY);

		// Add points
		this.#points += this.#gameSettings.pointsPerSecond * this.#gameSettings.deltaT;
		this.#pointsDisplay.textContent = parseInt(this.#points).toString().padStart(8, "0");

		// Reduce health
		this.#health -= this.#gameSettings.damagePerSecond * this.#gameSettings.deltaT;
		this.#health = Math.max(0, this.#health);
		this.#healthDisplay.style.width = this.#health.toString() + '%';

		// Update lasers
		if (frameCount > this.#lastShootingFrame + this.#gameSettings.laserCooldown / this.#gameSettings.deltaT) {
			this.#canShoot = true;
		}

		if (this.isShooting && this.#canShoot && this.#lastLaser >= 0) {
			this.#shoot(frameCount);
		} else if (this.#lastLaser < this.#lasers.length - 1 && 
			frameCount > this.#lastShootingFrame + this.#gameSettings.laserReloadTime / this.#gameSettings.deltaT) {
			this.#reload(frameCount);
		}
	}

	isDead() {
		return this.#health <= 0;
	}

	getScore() {
		return parseInt(this.#points).toString();
	}

	onRingCollided(ring) {
		console.log("Cockpit: ring hit");
		// Add health
		this.#health += this.#gameSettings.ringRestoreHealth;
		this.#health = Math.min(100, this.#health);
		this.#healthDisplay.style.width = this.#health.toString() + '%';

		// Add points
		this.#points += this.#gameSettings.ringPoints;
		this.#pointsDisplay.textContent = parseInt(this.#points).toString().padStart(8, "0");

		this.ringHit.invoke(this);
	}

	onAsteroidCollided(asteroid) {
		console.log("Cockpit: asteroid hit");
		// Reduce health
		this.#health -= this.#gameSettings.asteroidDamage;
		this.#health = Math.max(0, this.#health);
		this.#healthDisplay.style.width = this.#health.toString() + '%';

		// Reduce points
		this.#points -= this.#gameSettings.asteroidPoints;
		this.#points = Math.max(0, this.#points);
		this.#pointsDisplay.textContent = parseInt(this.#points).toString().padStart(8, "0");

	}

	onGroundCollided() {
		console.log("Cockpit: ground hit");
		// Reduce health
		this.#health -= this.#gameSettings.terrainDamage;
		this.#health = Math.max(0, this.#health);
		this.#healthDisplay.style.width = this.#health.toString() + '%';

		// Reduce points
		this.#points -= this.#gameSettings.terrainPoints;
		this.#points = Math.max(0, this.#points);
		this.#pointsDisplay.textContent = parseInt(this.#points).toString().padStart(8, "0");
	}

	#shoot(frameCount) {
		this.#lastShootingFrame = frameCount;
		this.#lasers[this.#lastLaser].style.opacity = 0;
		this.#lastLaser--;
		this.#canShoot = false;

		// Shoot the first laser, then move it to the back of the list
		this.#laserPool[0].shoot(this.position);
		this.#laserPool.push(this.#laserPool.shift());
	}

	#reload(frameCount) {
		this.#lastShootingFrame = frameCount;
		this.#lastLaser++;
		this.#lasers[this.#lastLaser].style.opacity = 1;
	}

	#keyFunctionDown(cockpit) {
		return function (e) {
			if (e.keyCode === 87) {	// W
				cockpit.up = cockpit.deltaSpeed;
			}
			if (e.keyCode === 83) {	// S
				cockpit.down = cockpit.deltaSpeed;
			}
			if (e.keyCode === 65) {	// A
				cockpit.left = cockpit.deltaSpeed;
			}
			if (e.keyCode === 68) {	// D
				cockpit.right = cockpit.deltaSpeed;
			}
			if (e.keyCode === 32) {	// Space
				cockpit.isShooting = true;
			}
		}
	}

	#keyFunctionUp(cockpit) {
		return function (e) {
			if (e.keyCode === 87) {	// W
				cockpit.up = 0;
			}
			if (e.keyCode === 83) {	// S
				cockpit.down = 0;
			}
			if (e.keyCode === 65) {	// A
				cockpit.left = 0;
			}
			if (e.keyCode === 68) {	// D
				cockpit.right = 0;
			}
			if (e.keyCode === 32) {	// Space
				cockpit.isShooting = false;
			}
		}
	}
}

export default Cockpit;
