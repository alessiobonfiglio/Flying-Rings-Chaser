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

	static loadInfoFromObjModel(objModel) {
		Spaceship.#centerOfGravity = GameObject._computeCenterOfGravity(objModel);
		Spaceship.#colliderRadius = GameObject._computeRadius(objModel, Spaceship.#centerOfGravity);
	}

	// properties
	get localCenterOfGravity() {
		return Spaceship.#centerOfGravity;
	}


	// engine events
	update() {
		super.update();
		this.position = MathUtils.sum(this.position, [0.01,0.01,0.01]);
		this.orientation[0] += 0.5;
		this.orientation[1] += 1.0;
		this.orientation[2] += 1.5;
	}


}

export default Spaceship;
