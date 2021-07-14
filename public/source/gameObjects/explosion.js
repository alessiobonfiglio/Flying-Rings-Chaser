import { default as GameObject } from "./gameObject.js";
import { DefaultShaderClass } from "../../shaders/shaderClasses.js";
import { default as MathUtils } from "../math_utils.js";
import Animations from "../utils/animations.js";
import ParticlesEmitter from "./particlesEmitter.js";

class Explosion extends GameObject {
	static objFilename = "resources/cube/cube.obj";
	static textureFilename = "resources/cube/crate.png";
	static shaderClass = new DefaultShaderClass();
	static #centerOfGravity
	_materialColor = [0.5, 0.5, 0.5];

	position = [0, -1, 4];
	orientation = [180, 0, 0];
	velocity = [0,0,0];
	scale = 5;
	isVisible = false;    	
    #gameSettings;
	#particleEmitter;
	static #colliderRadius;

	// Initialization
	constructor(gameSettings) {
		super();
        this.#gameSettings = gameSettings;
	}

	static loadInfoFromObjModel(objModel) {
		Explosion.#centerOfGravity = GameObject._computeCenterOfGravity(objModel);
		Explosion.#colliderRadius = GameObject._computeRadius(objModel, Explosion.#centerOfGravity);
	}

	// Properties
	get localCenterOfGravity() {
		return Explosion.#centerOfGravity;
	}


    // Engine Events
    update() {
		super.update();
        // pos(t + deltaT) = pos(t) + velocity * deltaT
        this.center = MathUtils.sum(this.center, MathUtils.mul(this.#gameSettings.deltaT, this.velocity));		
		if(this.#particleEmitter)
			this.#particleEmitter.center = this.center;
	}	

    // Public
    async explode() {
		this.#particleEmitter = new ParticlesEmitter();
		await this.#particleEmitter.emit();
		this.destroy();
    }
}

export default Explosion;
