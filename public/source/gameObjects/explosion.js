import { default as GameObject } from "./gameObject.js";
import { DefaultShaderClass } from "../../shaders/shaderClasses.js";
import { default as CircleCollider } from "../colliders/sphericalCollider.js";
import { default as MathUtils } from "../math_utils.js";

class Explosion extends GameObject {
	static objFilename = "resources/cube/cube.obj";
	static textureFilename = "resources/cube/crate.png";
	static shaderClass = new DefaultShaderClass();
	static #centerOfGravity
	static #colliderRadius
	_materialColor = [0.5, 0.5, 0.5];

	position = [0, -1, 4];
	orientation = [180, 0, 0];
	velocity = [0,0,0];
	scale = 5;
	isVisible = false;    	
    #gameSettings;

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
        this.position = MathUtils.sum(this.position, MathUtils.mul(this.#gameSettings.deltaT, this.velocity));		
	}	

    // Public
    async explode() {
		let startScale = this.scale;	
		this.scale = 0;	
        this.isVisible = true;        
		await this.scaleTo(startScale, 0.2);
        console.log("Exploded");
		setTimeout(() => {
			this.destroy();
		}, 3000);
    }
}

export default Explosion;
