import { default as GameObject } from "./gameObject.js";
import { CockpitShaderClass } from "../../shaders/shaderClasses.js";
import { default as CircleCollider } from "../colliders/sphericalCollider.js";
import { default as MathUtils } from "../math_utils.js";

class Laser extends GameObject {
	static objFilename = "resources/laser/laser.obj";
	static textureFilename = "resources/laser/warp_blue.png";
	static shaderClass = new CockpitShaderClass();
	static #colliderRadius;
	static #centerOfGravity;
	_materialColor = [0.5, 0.5, 0.5];

	#gameSettings;

	position = [0, -1, 4];
	orientation = [180, 0, 0];
	speed;
	isVisible = false;

	// Initialization
	constructor() {
		super();
		this.collider = new CircleCollider();
		this.collider.radius = Laser.#colliderRadius;
		this.collider.thickness = 1;
		this.collider.normal = [0, 0, 1];
	}

	// Initialization
	initialize(gameSettings) {
		this.#gameSettings = gameSettings;
		this.speed = gameSettings.laserSpeed;
	}
	
	static loadInfoFromObjModel(objModel) {
		Laser.#centerOfGravity = GameObject._computeCenterOfGravity(objModel);
		Laser.#colliderRadius = GameObject._computeRadius(objModel, Laser.#centerOfGravity);
	}

	update() {
		super.update();
		if (this.isVisible)
			this.#moveForward(this.#gameSettings);
	}

	#moveForward(gameSettings) {
		this.position[2] += this.speed * (gameSettings.gameSpeed / gameSettings.fpsLimit);
		// Make it go beyond gameSettings.maxZ because of the light it irradiates
		if (this.position[2] > gameSettings.maxZ * 1.5)
			this.isVisible = false;
	}

	shoot(cockpitPosition) {
		this.position = MathUtils.sum(cockpitPosition, [0, -1, 4]);
		this.isVisible = true;
	}

	onAsteroidCollided(asteroid) {
		console.log("Laser: asteroid hit");
		this.isVisible = false;
	}
}

export default Laser;
