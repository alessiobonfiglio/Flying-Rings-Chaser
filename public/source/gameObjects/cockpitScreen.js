import {default as GameObject} from "./gameObject.js";
import {CockpitScreenShaderClass} from "../../shaders/shaderClasses.js";
import {default as utils} from "../utils.js";

class CockpitScreen extends GameObject {
	static objFilename = "resources/cockpit/cockpit_only_screen.obj";
	static textureFilename = "resources/cockpit/cockpit_screen_texture.png";
	static shaderClass = new CockpitScreenShaderClass();

	#cockpit;
	#gameSettings;
	#animationCounter = 0.0;

	constructor(gameSettings, cockpit) {
		super();
		this.#cockpit = cockpit;
		this.#gameSettings = gameSettings;
	}

	update() {
		super.update();
		this.position = this.#cockpit.position;
		this.orientation = this.#cockpit.orientation;
		this.scale = this.#cockpit.scale;
		this.isVisible = this.#cockpit.isVisible;

		const maxAnimationCounterValue = 12;
		this.#animationCounter = (this.#animationCounter + this.#gameSettings.cockpitScreenAnimationSpeed * this.#gameSettings.deltaT) % maxAnimationCounterValue;
	}


	uvTransformMatrix() {
		const delta = 0.0625;
		let du = 0.0, dv = 0.75;

		du += delta * (Math.floor(this.#animationCounter / 3));
		dv -= delta * (Math.floor(this.#animationCounter % 3));

		if (this.#cockpit.up > 0 && this.#cockpit.down <= 0) {
			dv += 3 * delta;
		} else if (this.#cockpit.down > 0 && this.#cockpit.up <= 0) {
			dv -= 3 * delta;
		}

		if (this.#cockpit.left > 0 && this.#cockpit.right <= 0) {
			du += 4 * delta;
		} else if (this.#cockpit.right > 0 && this.#cockpit.left <= 0) {
			du += 8 * delta;
		}		

		return utils.MakeTranslateMatrix2D(du, dv)
	}
}

export default CockpitScreen;
