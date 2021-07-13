import {default as utils} from "/source/utils.js"
import { default as MathUtils } from "../math_utils.js"
import GameObject from "./gameObject.js";
import CancellationToken from "../utils/cancellationToken.js";


class Camera extends GameObject {
	position = [0, 0, 0];
	horizontalAngle;
	verticalAngle;
	#cockpit;
	#zPos;
	#startZPos = 0.65;
	#boostDuration = 0.6;
	fov = 90;
	#totBosts = 0;
	#animationCancellationToken = new CancellationToken();

	constructor(position, horizontalAngle, verticalAngle) {
		super();
		this.position = position;
		this.horizontalAngle = horizontalAngle;
		this.verticalAngle = verticalAngle;		
		this.#zPos = this.#startZPos;
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
		// Aborting prebious animation if any
		this.#animationCancellationToken.abort();
		const cancellationToken = new CancellationToken();
		this.#animationCancellationToken = cancellationToken;

		let [start, end] = [this.fov, 110];
		let [startZ, endZ] = [this.#zPos, 0.7 * this.#zPos];
		
		this.#totBosts++;				
		const cancelCondition = () => cancellationToken.isAborted;
		await Promise.all([
			this.animation(fov => this.fov = fov, this.#boostDuration, start, end, cancelCondition),
			this.animation(z => this.#zPos = z, this.#boostDuration, startZ, endZ, cancelCondition)
		]);

		await this.delay(this.#boostDuration/2);

		console.log("nice")
		await Promise.all([
			this.animation(fov => this.fov = fov, this.#boostDuration*3, end, start, cancelCondition),
			this.animation(z => this.#zPos = z, this.#boostDuration*3, endZ, this.#startZPos, cancelCondition)
		]);
		this.#totBosts--
	}
}

export default Camera;
