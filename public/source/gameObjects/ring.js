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
	#collided = false;
	#spaceShip;

	// Initialization
	constructor() {
		super();
		this.orientation = [90,0,0];
		this.collider = new CircleCollider();
		this.collider.radius = Ring.#colliderRadius;
		this.collider.thickness = 1;
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
		if(!this.#collided)
			this.#moveForward(this.#gameSettings);
		else {
			var newCenter = this.center;
			newCenter[0] = this.#spaceShip.center[0];
			newCenter[1] = this.#spaceShip.center[1];	
			// newCenter[2] = spaceship.center[3];
			this.center = newCenter;		
		}
	}
	
	#moveForward(gameSettings) {
		this.position[2] -= this.speed * gameSettings.deltaT;

		if (this.position[2] < 0) {
			this.initialize(gameSettings);
			return;
		}
		this.orientation[0] = (this.orientation[0] + 1) % 360;
	}

	bindCollider() {
		super.bindCollider();
		this.collider.center = MathUtils.sum(this.center, [0,0,-10])		
	}

	async onSpaceshipCollided(spaceship) {
		if(this.#collided)
			return;
		
		this.#spaceShip = spaceship;
		this.#collided = true;
		let startScale = this.scale;
		await this.#collapseRing(spaceship);	
		this.scale = startScale;
		this.#collided = false;
		this.initialize(this.#gameSettings);	
	}

	async #collapseRing(spaceship) {
		
		let animationDuration = 0.5; //s
		let scaleAnimation = this.scaleTo(0, animationDuration);
		let rotationAnimaiton = this.animation3(orientation => this.orientation = orientation, animationDuration, this.orientation, [90,0,0]);
		await Promise.all([scaleAnimation, rotationAnimaiton]);
	}
}

export default Ring;
