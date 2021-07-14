import {default as GameObject} from "./gameObject.js"
import {RingShaderClass} from "../../shaders/shaderClasses.js";
import {default as CircleCollider} from "../colliders/circleCollider.js"
import {default as MathUtils} from "../math_utils.js"
import {default as Animations} from "../utils/animations.js"

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
		this.orientation = [90, 0, 0];
		this.collider = new CircleCollider();
		this.collider.radius = Ring.#colliderRadius;
		this.collider.thickness = 5;
		this.collider.normal = [1, 0, 0];
	}

	// Initialization
	initialize(gameSettings) {
		this.#gameSettings = gameSettings;

		let x, y;
		const z = Ring.lastRing.position[2] + gameSettings.exactRingDistanceZ;
		do {
			x = MathUtils.getRandomInRange(-gameSettings.maxHalfX, gameSettings.maxHalfX);
			y = MathUtils.getRandomInRange(-gameSettings.maxHalfY + gameSettings.liftGameObjectsOffset, gameSettings.maxHalfY);
		} while (MathUtils.distance(Ring.lastRing.position, [x, y, z]) > gameSettings.maxRingDistance);

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
	update(_, boostFactor) {
		super.update();
		if (!this.#collided)
			this.#moveForward(this.#gameSettings, boostFactor);
		else {
			const newCenter = this.center;
			newCenter[0] = this.#spaceShip.center[0];
			newCenter[1] = this.#spaceShip.center[1];
			this.center = newCenter;
		}
	}

	#moveForward(gameSettings, boostFactor) {
		this.position[2] -= this.speed * boostFactor * gameSettings.deltaT;

		if (this.position[2] < 0) {
			this.initialize(gameSettings);
			return;
		}
		this.#rotate();
	}

	#rotationDir;
	#currentAngle = 0;
	#rotationAngle = 25;

	#rotate() {
		const newDir = () => {
			return MathUtils.normalize([Math.random() - 0.5, 0, Math.random() - 0.5]);
		}

		this.#rotationDir ??= newDir();
		if (this.#currentAngle >= 2 * this.#rotationAngle) {
			this.#rotationDir = newDir();
			this.#currentAngle = 0;
		} else if (this.#currentAngle === this.#rotationAngle) {
			this.#rotationDir = MathUtils.mul(-1, this.#rotationDir)
		}

		this.orientation = MathUtils.sum(this.orientation, this.#rotationDir);
		this.#currentAngle++;
	}

	bindCollider() {
		super.bindCollider();
		this.collider.center = MathUtils.sum(this.center, [0, 0, -10])
	}

	async onSpaceshipCollided(spaceship) {
		if (this.#collided)
			return;

		this.#spaceShip = spaceship;
		this.#collided = true;
		const startScale = this.scale;
		// await this.#collapseRing(spaceship);
		this.scale = startScale;
		this.#collided = false;
		this.initialize(this.#gameSettings);
	}

	async #collapseRing(spaceship) {

		const animationDuration = 0.5; //s
		const scaleAnimation = this.scaleTo(0, animationDuration);
		const rotationAnimation = Animations.lerp3(orientation => this.orientation = orientation, animationDuration, this.orientation, [90,0,0]);
		await Promise.all([scaleAnimation, rotationAnimation]);
	}
}

export default Ring;
