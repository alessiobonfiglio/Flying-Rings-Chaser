import {default as GameObject} from "./gameObject.js";
import {DefaultShaderClass} from "../../shaders/shaderClasses.js";
import {default as MathUtils} from "../math_utils.js";
import {default as SphericalCollider} from "../colliders/sphericalCollider.js";
import {default as Event} from "../utils/event.js";

// Abstract class, must be extended with object file and texture
class Asteroid extends GameObject {
	death = new Event();
	static shaderClass = new DefaultShaderClass();
	#gameSettings;
	#isBackground;

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

		const rx = MathUtils.getRandomInRange(0, 360);
		const ry = MathUtils.getRandomInRange(0, 360);
		const rz = MathUtils.getRandomInRange(0, 360);
		this.orientation = [rx, ry, rz];

		this.scale = MathUtils.getRandomInRange(gameSettings.asteroidScaleRange[0], gameSettings.asteroidScaleRange[1]);
		this.speed = MathUtils.getRandomInRange(gameSettings.asteroidSpeedRange[0], gameSettings.asteroidSpeedRange[1]);

		const rsx = MathUtils.getRandomInRange(gameSettings.asteroidRotationSpeedRange[0], gameSettings.asteroidRotationSpeedRange[1]);
		const rsy = MathUtils.getRandomInRange(gameSettings.asteroidRotationSpeedRange[0], gameSettings.asteroidRotationSpeedRange[1]);
		const rsz = MathUtils.getRandomInRange(gameSettings.asteroidRotationSpeedRange[0], gameSettings.asteroidRotationSpeedRange[1]);
		this.rotationSpeed = [rsx, rsy, rsz];
	}

	#setupBackgroundPosition(gameSettings) {
		const rand = Math.random();
		let x, y;
		if (rand < 2 / 8) {
			// Left side of the box
			x = MathUtils.getRandomInRange(-gameSettings.maxHalfX * 2, -gameSettings.maxHalfX);
			y = MathUtils.getRandomInRange(-gameSettings.maxHalfY + gameSettings.liftGameObjectsOffset, gameSettings.maxHalfY);
		} else if (rand < 4 / 8) {
			// Right side of the box
			x = MathUtils.getRandomInRange(gameSettings.maxHalfX, gameSettings.maxHalfX * 2);
			y = MathUtils.getRandomInRange(-gameSettings.maxHalfY + gameSettings.liftGameObjectsOffset, gameSettings.maxHalfY);
		} else {
			// Top side of the box
			x = MathUtils.getRandomInRange(-gameSettings.maxHalfX * 2, gameSettings.maxHalfX * 2);
			y = MathUtils.getRandomInRange(gameSettings.maxHalfY, gameSettings.maxHalfY * 2);
		}
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
		this.orientation[0] += (this.rotationSpeed[0] * gameSettings.deltaT) % 360;
		this.orientation[1] += (this.rotationSpeed[1] * gameSettings.deltaT) % 360;
		this.orientation[2] += (this.rotationSpeed[2] * gameSettings.deltaT) % 360;
	}

	onSpaceshipCollided(spaceship) {
		this.initialize(this.#gameSettings);
	}

	onLaserCollided(laser) {
		console.log("Asteroid: laser hit");
		this.health--;
		if (this.health <= 0)
			this.#onAsteroidDeath();
	}


	#onAsteroidDeath() {
		this.death.invoke(this);

		// initialization should be called after the event handling
		this.initialize(this.#gameSettings);
	}
}

export default Asteroid;
