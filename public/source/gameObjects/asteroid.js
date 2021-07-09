import {default as GameObject} from "./gameObject.js"
import {DefaultShaderClass} from "../../shaders/shaderClasses.js";
import {default as MathUtils} from "../math_utils.js";
import { default as SphericalCollider } from "../colliders/sphericalCollider.js"

class Asteroid extends GameObject {
	static objFilename = "resources/asteroids/brown_asteroid_n.obj";
	static textureFilename = "resources/asteroids/brown.png";
	static shaderClass = new DefaultShaderClass();
	static #colliderRadius;
	static #centerOfGravity;
	#gameSettings;
	_materialColor = [0.5, 0.5, 0.5];

	speed = 1;
	rotationSpeed = [1, 1, 1];

	// Initialization
	constructor() {
		super();
		this.collider = new SphericalCollider();
		this.collider.radius = Asteroid.#colliderRadius;
	}

	// Initialization
	initialize(gameSettings) {
		this.#gameSettings = gameSettings;

		const x = MathUtils.getRandomInRange(-gameSettings.maxHalfX, gameSettings.maxHalfX);
		const y = MathUtils.getRandomInRange(-gameSettings.maxHalfY, gameSettings.maxHalfY);
		const z = MathUtils.getRandomInRange(gameSettings.maxZ * 2 / 3, gameSettings.maxZ);
		this.position = [x, y, z];

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
	
	static loadInfoFromObjModel(objModel) {
		Asteroid.#centerOfGravity = GameObject._computeCenterOfGravity(objModel);
		Asteroid.#colliderRadius = GameObject._computeRadius(objModel, Asteroid.#centerOfGravity);
	}

	// game events handlers
	update() {
		super.update();
		this.#moveForward(this.#gameSettings);
	}

	hit = false;
	#moveForward(gameSettings) {
		if(this.hit)
			return;
		this.position[2] -= this.speed * (gameSettings.gameSpeed / gameSettings.fpsLimit);
		if (this.position[2] < 0) {
			this.initialize(gameSettings);
			return;
		}
		this.orientation[0] += (this.rotationSpeed[0] * (gameSettings.gameSpeed / gameSettings.fpsLimit)) % 360;
		this.orientation[1] += (this.rotationSpeed[1] * (gameSettings.gameSpeed / gameSettings.fpsLimit)) % 360;
		this.orientation[2] += (this.rotationSpeed[2] * (gameSettings.gameSpeed / gameSettings.fpsLimit)) % 360;
	}

	onSpaceshipCollided(spaceship) {
		this.initialize(this.#gameSettings);
	}
}

export default Asteroid;
