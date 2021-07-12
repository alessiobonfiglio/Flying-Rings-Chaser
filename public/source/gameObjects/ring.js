import { default as GameObject } from "./gameObject.js"
import { RingShaderClass } from "../../shaders/shaderClasses.js";
import { default as CircleCollider } from "../colliders/circleCollider.js"
import { default as MathUtils } from "../math_utils.js"

class Ring extends GameObject {
	static objFilename = "resources/ring/ring_smooth.obj";
	static textureFilename = null;
	static shaderClass = new RingShaderClass();
	static lastRing;
	static #colliderRadius;
	static #centerOfGravity;
	#gameSettings;
	_materialColor = [1, 215 / 255, 0];

	// Initialization
	constructor() {
		super();
		this.orientation = [90,0,0];
		this.collider = new CircleCollider();
		this.collider.radius = Ring.#colliderRadius;
		this.collider.thickness = 0.5;
		this.collider.normal = [0, 0, 1];
	}

	// Initialization
	initialize(gameSettings) {
		this.#gameSettings = gameSettings;

		const x = MathUtils.getRandomInRange(-gameSettings.maxHalfX, gameSettings.maxHalfX);
		const y = MathUtils.getRandomInRange(-gameSettings.maxHalfY, gameSettings.maxHalfY);
		const z = Math.max(gameSettings.maxZ * 2 / 3, Ring.lastRing.position[2] + gameSettings.minRingDistance);
		this.position = [x, y, z];
		Ring.lastRing = this;

		this.scale = MathUtils.getRandomInRange(gameSettings.ringScaleRange[0], gameSettings.ringScaleRange[1]);
		this.speed = MathUtils.getRandomInRange(gameSettings.ringSpeedRange[0], gameSettings.ringSpeedRange[1]);
	}

	static loadInfoFromObjModel(objModel) {
		Ring.#centerOfGravity = GameObject._computeCenterOfGravity(objModel);
		Ring.#colliderRadius = GameObject._computeRadius(objModel, Ring.#centerOfGravity);
	}

	// Properties
	get localCenterOfGravity() {
		return Ring.#centerOfGravity;
	}

	// events
	update() {
		super.update();
		this.#moveForward(this.#gameSettings);
	}
	
	#moveForward(gameSettings) {
		this.position[2] -= this.speed * gameSettings.deltaT;
		if (this.position[2] < 0) {
			this.initialize(gameSettings);
			return;
		}
		this.orientation[0] = (this.orientation[0] + 1) % 360;
	}

	onSpaceshipCollided(spaceship) {
		this.initialize(this.#gameSettings);
	}
}

export default Ring;
