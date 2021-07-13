import { default as GameObject } from "./gameObject.js";
import { default as Asteroid } from "./asteroid.js";

class GreyAsteroid extends Asteroid {
	static objFilename = "resources/asteroids/medium_grey_asteroid_n.obj";
	static textureFilename = "resources/asteroids/grey.png";
	static #colliderRadius;
	static #centerOfGravity;

	constructor() {
		super();
		this.collider.radius = GreyAsteroid.#colliderRadius;
	}

	static loadInfoFromObjModel(objModel) {
		GreyAsteroid.#centerOfGravity = GameObject._computeCenterOfGravity(objModel);
		GreyAsteroid.#colliderRadius = GameObject._computeRadius(objModel, GreyAsteroid.#centerOfGravity);
	}

	get localCenterOfGravity() {
		return GreyAsteroid.#centerOfGravity;
	}
}

export default GreyAsteroid;
