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
	asteroidHit = new Event();

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
	orientation;
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
		this.orientation = [0, 0, 0];
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
		this.position[0] += (this.left - this.right) * this.#gameSettings.cockpitSpeed * this.#gameSettings.deltaT;
		this.position[1] += (this.up - this.down) * this.#gameSettings.cockpitSpeed * this.#gameSettings.deltaT;

		// Clamp position to borders
		this.position[0] = MathUtils.clamp(this.position[0], -this.#gameSettings.maxHalfX, this.#gameSettings.maxHalfX);
		this.position[1] = MathUtils.clamp(this.position[1], -this.#gameSettings.maxHalfY, this.#gameSettings.maxHalfY);

		// Cockpit oscillations
		if (this.down - this.up !== 0)
			this.orientation[0] += (this.down - this.up) * this.#gameSettings.oscillationSpeedX * this.#gameSettings.deltaT;
		else if (Math.abs(this.orientation[0]) > 1e-12)
			this.orientation[0] -= Math.sign(this.orientation[0]) * this.#gameSettings.oscillationSpeedX * this.#gameSettings.deltaT;
		if (this.right - this.left !== 0) {
			this.orientation[1] += (this.left - this.right) * this.#gameSettings.oscillationSpeedY * this.#gameSettings.deltaT;
			this.orientation[2] += (this.left - this.right) * this.#gameSettings.oscillationSpeedZ * this.#gameSettings.deltaT;
		}
		else if (Math.abs(this.orientation[1]) > 1e-12) {
			this.orientation[1] -= Math.sign(this.orientation[1]) * this.#gameSettings.oscillationSpeedY * this.#gameSettings.deltaT;
			this.orientation[2] -= Math.sign(this.orientation[2]) * this.#gameSettings.oscillationSpeedZ * this.#gameSettings.deltaT;
		}

		// Clamp oscillation
		this.orientation[0] = MathUtils.clamp(this.orientation[0], -this.#gameSettings.maxOscillationX, this.#gameSettings.maxOscillationX);
		this.orientation[1] = MathUtils.clamp(this.orientation[1], -this.#gameSettings.maxOscillationY, this.#gameSettings.maxOscillationY);
		this.orientation[2] = MathUtils.clamp(this.orientation[2], -this.#gameSettings.maxOscillationZ, this.#gameSettings.maxOscillationZ);

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
		this.asteroidHit.invoke(this);
	}

	onLaserCollided(laser) {
		// Add points
		this.#points += this.#gameSettings.laserPoints;
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
		this.#laserPool[0].shoot(this.position, this.orientation);
		this.#laserPool.push(this.#laserPool.shift());
	}

	#reload(frameCount) {
		this.#lastShootingFrame = frameCount;
		this.#lastLaser++;
		this.#lasers[this.#lastLaser].style.opacity = 1;
	}

	#keyFunctionDown(cockpit) {
		return function (e) {
			switch(e.keyCode) {
				case 87: // W
					cockpit.up = 1;
					break;
				case 83: // S
					cockpit.down = 1;
					break;
				case 65: // A
					cockpit.left = 1;
					break;
				case 68: // D
					cockpit.right = 1;
					break;
				case 32: // Space
					cockpit.isShooting = true;
			}
		}
	}

	#keyFunctionUp(cockpit) {
		return function (e) {
			switch(e.keyCode) {
				case 87: // W
					cockpit.up = 0;
					break;
				case 83: // S
					cockpit.down = 0;
					break;
				case 65: // A
					cockpit.left = 0;
					break;
				case 68: // D
					cockpit.right = 0;
					break;
				case 32: // Space
					cockpit.isShooting = false;
			}
		}
	}
}

export default Cockpit;
