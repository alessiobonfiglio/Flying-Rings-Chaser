import { default as GameObject } from "./gameObject.js";
import { DefaultShaderClass } from "../../shaders/shaderClasses.js"
import { default as SphericalCollider } from "../colliders/sphericalCollider.js"
import { default as MathUtils } from "../math_utils.js"

class Spaceship extends GameObject {
	static objFilename = "resources/spaceship/X-WING.obj";
	static textureFilename = "resources/spaceship/X-Wing-Colors.png";
	static shaderClass = new DefaultShaderClass();
	static #colliderRadius;
	static #centerOfGravity;
	_materialColor = [0.5, 0.5, 0.5];


	// Initialization
	constructor() {
		super();
		this.collider = new SphericalCollider();
		this.collider.radius = Spaceship.#colliderRadius;
		this.orientation = [0, 90, 0];
	}

	// properties
	get localCenterOfGravity() {
		return Spaceship.#centerOfGravity;
	}

	static loadInfoFromObjModel(objModel) {
		Spaceship.#centerOfGravity = GameObject._computeCenterOfGravity(objModel);
		Spaceship.#colliderRadius = GameObject._computeRadius(objModel, Spaceship.#centerOfGravity);
	}

	// engine events
	tot = 0;
	sign = 1;
	update() {
		super.update();
		var deltaPos = 1;
		if (this.tot > 600) {
			this.sign *= -1;
			this.tot = 0;
		}
		this.position = MathUtils.sum(this.position, MathUtils.mul(this.sign * deltaPos, [0, 0, 1]));
		this.tot += deltaPos;		
	}

	onRingCollided(ring) {
		console.log("Spaceship: ring hit");
	}

	onAsteroidCollided(asteroid) {
		console.log("Spaceship: asteroid hit");
	}
}

export default Spaceship;
