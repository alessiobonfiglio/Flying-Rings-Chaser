import { default as GameObject } from "./gameObject.js";
import { default as Asteroid } from "./asteroid.js";

class BrownAsteroid extends Asteroid {
	static objFilename = "resources/asteroids/brown_asteroid_n.obj";
	static textureFilename = "resources/asteroids/brown.png";
	static #colliderRadius;
	static #centerOfGravity;

	constructor(isBackground) {
		super(isBackground);
		this.collider.radius = BrownAsteroid.#colliderRadius;
	}

	static loadInfoFromObjModel(objModel) {
		BrownAsteroid.#centerOfGravity = GameObject._computeCenterOfGravity(objModel);
		BrownAsteroid.#colliderRadius = GameObject._computeRadius(objModel, BrownAsteroid.#centerOfGravity);
	}

	get localCenterOfGravity() {
		return BrownAsteroid.#centerOfGravity;
	}
}

export default BrownAsteroid;
