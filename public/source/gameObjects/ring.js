import { default as GameObject } from "./gameObject.js"
import { RingShaderClass } from "../../shaders/shaderClasses.js";
import { default as CircleCollider } from "../colliders/circleCollider.js"
import { default as MathUtils } from "../math_utils.js"

class Ring extends GameObject {
	static objFilename = "resources/ring/ring.obj";
	static textureFilename = null;
	static shaderClass = new RingShaderClass();
	static #colliderRadius;
	static #centerOfGravity;
	_materialColor = [255 / 255, 215 / 255, 0 / 255];

	// Initialization
	constructor() {
		super();
		this.collider = new CircleCollider();
		this.collider.radius = Ring.#colliderRadius;
		this.collider.thickness = 0.5;
		this.collider.normal = [0, 0, 1];
		this.orientation = [90,0,0];
		this.scale = 12;
	}

	static loadInfoFromObjModel(objModel) {
		Ring.#centerOfGravity = GameObject._computeCenterOfGravity(objModel);
		Ring.#colliderRadius = GameObject._computeRadius(objModel, Ring.#centerOfGravity);
	}

	// events
	update() {
		super.update();
		this.orientation[0] += 1;
	}

	onSpaceshipCollided(spaceship) {

		this.destroy();
	}
}

export default Ring;