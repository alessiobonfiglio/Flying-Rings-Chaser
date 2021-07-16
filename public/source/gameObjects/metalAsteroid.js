import {default as GameObject} from "./gameObject.js";
import {default as Asteroid} from "./asteroid.js";
import {metalAsteroidShaderClass} from "../../shaders/shaderClasses.js";

class MetalAsteroid extends Asteroid {
	static objFilename = "resources/asteroids/metal_asteroid_n.obj";
	static textureFilename = "resources/asteroids/metal.png";
	static shaderClass = new metalAsteroidShaderClass();
	static #colliderRadius;
	static #centerOfGravity;

	constructor(isBackground) {
		super(isBackground);
		this.collider.radius = MetalAsteroid.#colliderRadius;
	}

	static loadInfoFromObjModel(objModel) {
		MetalAsteroid.#centerOfGravity = GameObject._computeCenterOfGravity(objModel);
		MetalAsteroid.#colliderRadius = GameObject._computeRadius(objModel, MetalAsteroid.#centerOfGravity);
	}

	get localCenterOfGravity() {
		return MetalAsteroid.#centerOfGravity;
	}
}

export default MetalAsteroid;
