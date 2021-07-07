import { default as GameObject } from "./gameObject.js";
import { CockpitShaderClass } from "../../shaders/shaderClasses.js";
import { default as SphericalCollider } from "../colliders/sphericalCollider.js"
import { default as MathUtils } from "../math_utils.js"

class Cockpit extends GameObject {
	static objFilename = "resources/cockpit/Cockpit.obj";
	static shaderClass = new CockpitShaderClass();
    static #colliderRadius;
	static #centerOfGravity;

    #gameSettings;

	_materialColor = [0.2, 0.2, 0.2];
    position = [0, -0.85, 0.45];
    scale = 2;
    orientation = [180, -65, 180];
    deltaSpeed = 2;
    up = 0;
    down = 0;
    left = 0;
    right = 0;

    // Initialization
	constructor(window, gameSettings) {
		super();
		this.collider = new SphericalCollider();
		this.collider.radius = Cockpit.#colliderRadius;
        this.#gameSettings = gameSettings;
        window.addEventListener("keydown", this.#keyFunctionDown(this), false);
        window.addEventListener("keyup", this.#keyFunctionUp(this), false);
	}

    // properties
	get localCenterOfGravity() {
		return Cockpit.#centerOfGravity;
	}

	static loadInfoFromObjModel(objModel) {
		Cockpit.#centerOfGravity = GameObject._computeCenterOfGravity(objModel);
		Cockpit.#colliderRadius = GameObject._computeRadius(objModel, Cockpit.#centerOfGravity);
	}

    update() {
		super.update();
        // Move cockpit
        this.position = MathUtils.sum(this.position, [this.left - this.right, this.up - this.down, 0]);
        // Clamp position to borders
        this.position[0] = Math.min(Math.max(this.position[0], -this.#gameSettings.maxHalfX), this.#gameSettings.maxHalfX);
        this.position[1] = Math.min(Math.max(this.position[1], -this.#gameSettings.maxHalfY), this.#gameSettings.maxHalfY);
	}

    // override
	bindCollider() {
		super.bindCollider();
		this.collider.scale = this.scale * 0.9; 
	}

	onRingCollided(ring) {
        console.log("Cockpit: ring hit");
	}

	onAsteroidCollided(asteroid) {
		console.log("Cockpit: asteroid hit");
	}

	onGroundCollided() {
		console.log("Cockpit: gound hit");
	}

    #keyFunctionDown(cockpit) {
		return function(e) {
			if (e.keyCode == 87) {	// W
				cockpit.up = cockpit.deltaSpeed;
			}
            if (e.keyCode == 83) {	// S
                cockpit.down = cockpit.deltaSpeed;
            }
			if (e.keyCode == 65) {	// A
				cockpit.left = cockpit.deltaSpeed;
			}
			if (e.keyCode == 68) {	// D
				cockpit.right = cockpit.deltaSpeed;
			}
		}
	}

	#keyFunctionUp(cockpit) {
		return function(e) {
			if (e.keyCode == 87) {	// W
				cockpit.up = 0;
			}
            if (e.keyCode == 83) {	// S
                cockpit.down = 0;
            }
			if (e.keyCode == 65) {	// A
				cockpit.left = 0;
			}
			if (e.keyCode == 68) {	// D
				cockpit.right = 0;
			}
		}
	}
}

export default Cockpit;
