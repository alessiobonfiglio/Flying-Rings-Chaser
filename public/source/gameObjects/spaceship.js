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
		var deltaPos = 0.5;
		if (this.tot > 200) {
			this.sign *= -1;
			this.tot = 0;
		}
		this.position = MathUtils.sum(this.position, MathUtils.mul(this.sign * deltaPos, [0, 0, 1]));
		// this.position = [0,-1,4]
		this.tot += deltaPos;		
		// this.orientation[0] += 0.5;
		this.orientation[1] = 90;
		// this.orientation[2] += 1.5;
	}

	// override
	bindCollider() {
		super.bindCollider();
		this.collider.scale = this.scale * 0.9; 
	}

	onRingCollided(ring) {

	}

	onAsteroidCollided(asteroid) {
		console.log("asteroid hit")
	}
}

export default Spaceship;
