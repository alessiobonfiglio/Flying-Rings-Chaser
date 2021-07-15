import {default as GameObject} from "./gameObject.js";
import {DefaultShaderClass} from "../../shaders/shaderClasses.js";
import math_utils, {default as MathUtils} from "../math_utils.js";
import {default as SphericalCollider} from "../colliders/sphericalCollider.js";
import {default as Event} from "../utils/event.js";
import {default as utils} from "../utils.js";

// Abstract class, must be extended with object file and texture
class Asteroid extends GameObject {
	death = new Event();
	static shaderClass = new DefaultShaderClass();
	#gameSettings;
	#isBackground;

	rotationQuaternion = new Quaternion();

	speed = 1;
	rotationSpeed = [1, 1, 1];
	health;

	// Initialization
	constructor(isBackground) {
		super();
		this.#isBackground = isBackground;
		this.collider = new SphericalCollider();
	}

	// Initialization
	initialize(gameSettings) {
		this.#gameSettings = gameSettings;
		this.health = gameSettings.asteroidHealth;

		if (this.#isBackground) {
			this.position = this.#setupBackgroundPosition(gameSettings);
		} else {
			const x = MathUtils.getRandomInRange(-gameSettings.maxHalfX, gameSettings.maxHalfX);
			const y = MathUtils.getRandomInRange(-gameSettings.maxHalfY + gameSettings.liftGameObjectsOffset, gameSettings.maxHalfY);
			const z = MathUtils.getRandomInRange(gameSettings.maxZ * 2 / 3, gameSettings.maxZ * 5 / 3);
			this.position = [x, y, z];
		}

		const rx = MathUtils.getRandomInRange(0, 2 * Math.PI);
		const ry = MathUtils.getRandomInRange(0, 2 * Math.PI);
		const rz = MathUtils.getRandomInRange(0, 2 * Math.PI);
		this.rotationQuaternion = Quaternion.fromEuler(rx, ry, rz, "XYZ");

		this.scale = MathUtils.getRandomInRange(gameSettings.asteroidScaleRange[0], gameSettings.asteroidScaleRange[1]);
		this.speed = MathUtils.getRandomInRange(gameSettings.asteroidSpeedRange[0], gameSettings.asteroidSpeedRange[1]);

		const rsx = MathUtils.getRandomInRange(gameSettings.asteroidRotationSpeedRange[0], gameSettings.asteroidRotationSpeedRange[1]);
		const rsy = MathUtils.getRandomInRange(gameSettings.asteroidRotationSpeedRange[0], gameSettings.asteroidRotationSpeedRange[1]);
		const rsz = MathUtils.getRandomInRange(gameSettings.asteroidRotationSpeedRange[0], gameSettings.asteroidRotationSpeedRange[1]);
		this.rotationSpeed = [rsx, rsy, rsz];
	}

	#setupBackgroundPosition(gameSettings) {
		const padding = 5;

		let x, y;
		do {
			x = MathUtils.getRandomInRange(-gameSettings.maxHalfX * 2, gameSettings.maxHalfX * 2);
			y = MathUtils.getRandomInRange(-gameSettings.maxHalfY + gameSettings.liftGameObjectsOffset, gameSettings.maxHalfY * 2);
		} while (x > -gameSettings.maxHalfX - padding && x < gameSettings.maxHalfX + padding && y < gameSettings.maxHalfY + padding);

		const z = MathUtils.getRandomInRange(gameSettings.maxZ * 2 / 3, gameSettings.maxZ * 5 / 3);
		return [x, y, z];
	}

	// game events handlers
	update(_, boostFactor) {
		super.update();
		this.#moveForward(this.#gameSettings, boostFactor);
	}

	#moveForward(gameSettings, boostFactor) {
		this.position[2] -= this.speed * boostFactor * gameSettings.deltaT;
		if (this.position[2] < 0) {
			this.initialize(gameSettings);
			return;
		}
		this.rotateForward(gameSettings);
	}

	rotateForward(gameSettings) {
		const drx = (this.rotationSpeed[0] * gameSettings.deltaT) % 360;
		const dry = (this.rotationSpeed[1] * gameSettings.deltaT) % 360;
		const drz = (this.rotationSpeed[2] * gameSettings.deltaT) % 360;

		const deltaQ = Quaternion.fromEuler(utils.degToRad(drx), utils.degToRad(dry), utils.degToRad(drz), "XYZ");

		this.rotationQuaternion = deltaQ.mul(this.rotationQuaternion);
	}

	worldMatrix() {
		const translMatrix = utils.MakeTranslateMatrix(this.position[0], this.position[1], this.position[2]);
		const rotMatrix = this.rotationQuaternion.toMatrix4();
		const scaleMatrix = utils.MakeScaleMatrix(this.scale);

		return math_utils.multiplyAllMatrices(translMatrix, rotMatrix, scaleMatrix);
	}

	onSpaceshipCollided(spaceship) {
		this.position[2] -= spaceship.collider.scaledRadius * 6;
		this.#onAsteroidDeath(spaceship.center);
		this.initialize(this.#gameSettings);
	}

	onLaserCollided(laser) {
		console.log("Asteroid: laser hit");
		this.health--;
		if (this.health <= 0)
			this.#onAsteroidDeath(laser.center);
	}


	#onAsteroidDeath(hitCenter) {
		this.death.invoke(this, hitCenter);

		// initialization should be called after the event handling
		this.initialize(this.#gameSettings);
	}
}

export default Asteroid;
