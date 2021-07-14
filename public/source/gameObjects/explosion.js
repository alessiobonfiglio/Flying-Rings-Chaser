import { default as GameObject } from "./gameObject.js";
import { DefaultShaderClass } from "../../shaders/shaderClasses.js";
import { default as MathUtils } from "../math_utils.js";
import Animations from "../utils/animations.js";
import ParticlesEmitter from "./particlesEmitter.js";
import Square from "./square.js";
import Ring from "./ring.js";
import BrownAsteroid from "./brownAsteroid.js";
import Sphere from "./sphere.js";

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
	#sphere;
	#hitMinusCenter;

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
		if(this.#sphere)
			this.#sphere.center = MathUtils.sum(this.center, this.#hitMinusCenter);
	}	

    // Public
    async explode(asteroid, hitPosition) {
		this.#particleEmitter = new ParticlesEmitter();
		
		const newParticle = () => {
			var ret = new asteroid.constructor();
			ret.scale = asteroid.scale * MathUtils.getRandomInRange(0.1, 0.25);
			return ret; 	
		}
		const particles = this.#particleEmitter.emit(
			newParticle, 
			ast => {
				ast.orientation = MathUtils.sum(ast.orientation, MathUtils.randomVectorInRange(1,2))
				ast.center = MathUtils.sum(ast.center, [0,0,30]);				
			} 
		);				
		await Promise.all([particles]);
		this.destroy();
    }
}

export default Explosion;
