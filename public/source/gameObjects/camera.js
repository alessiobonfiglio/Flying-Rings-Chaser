import {default as utils} from "/source/utils.js"
import { default as MathUtils } from "../math_utils.js"
import GameObject from "./gameObject.js";

class Camera extends GameObject {
	position = [0, 0, 0];
	horizontalAngle;
	verticalAngle;
	#cockpit;
	#zPos = 0.65;
	#boostDuration = 0.6;

	constructor(position, horizontalAngle, verticalAngle) {
		super();
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
		this.position = MathUtils.sum(this.#cockpit.position, [0, -0.125, -this.#zPos]);
	}

	async boost() {
		console.log("hit")
		let startZ = this.#zPos;
		let endZ = 1.3*startZ;
		await this.animation(z => this.#zPos = z, this.#boostDuration, startZ, endZ);
		await this.delay(0.2);
		await this.animation(z => this.#zPos = z, this.#boostDuration*2, endZ, startZ);
	}
}

export default Camera;
