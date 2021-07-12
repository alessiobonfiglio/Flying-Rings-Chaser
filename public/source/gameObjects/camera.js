import {default as utils} from "/source/utils.js"
import { default as MathUtils } from "../math_utils.js"
import GameObject from "./gameObject.js";

class Camera extends GameObject {
	position = [0, 0, 0];
	horizontalAngle;
	verticalAngle;
	#cockpit;
	#zPos = 0.65;
	#boostDuration = 0.4;
	fov = 90;

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
		let [start, end] = [this.fov, 110];
		let [startZ, endZ] = [this.#zPos, 0.7 * this.#zPos];
		
		await Promise.all([
			this.animation(fov => this.fov = fov, this.#boostDuration, start, end),
			this.animation(z => this.#zPos = z, this.#boostDuration, startZ, endZ)
		]);

		await this.delay(this.#boostDuration/2);

		console.log("nice")
		await Promise.all([
			this.animation(fov => this.fov = fov, this.#boostDuration*2, end, start),
			this.animation(z => this.#zPos = z, this.#boostDuration*2, endZ, startZ)
		]);
	}
}

export default Camera;
