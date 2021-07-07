import {default as utils} from "/source/utils.js"
import { default as MathUtils } from "../math_utils.js"

class Camera {
	position = [0, 0, 0];
	horizontalAngle;
	verticalAngle;
	#cockpit;

	constructor(position, horizontalAngle, verticalAngle) {
		this.position = position;
		this.horizontalAngle = horizontalAngle;
		this.verticalAngle = verticalAngle;
	}

	initialize(cockpit) {
		this.#cockpit = cockpit;
	}

	viewMatrix() {
		return utils.MakeView(this.position[0], this.position[1], this.position[2], this.horizontalAngle, this.verticalAngle);
	}

	update() {
		//this.position = MathUtils.sum(this.#spaceship.center, [0,2,-3]);
		this.position = MathUtils.sum(this.#cockpit.position, [0, 1, -0.5]);
	}
}

export default Camera;
