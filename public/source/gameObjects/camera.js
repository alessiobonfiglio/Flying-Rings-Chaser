import {default as utils} from "/source/utils.js"
import { default as MathUtils } from "../math_utils.js"
import GameObject from "./gameObject.js";
import CancellationToken from "../utils/cancellationToken.js";
import Animations from "../utils/animations.js";


class Camera extends GameObject {
	position = [0, 0, 0];
	horizontalAngle;
	verticalAngle;
	#cockpit;
	#zPos;
	#startZPos = 0.65;
	#startFov = 90;
	#boostDuration = 1.2;
	fov;
	#animationCancellationToken = new CancellationToken();

	constructor(position, horizontalAngle, verticalAngle) {
		super();
		this.position = position;
		this.horizontalAngle = horizontalAngle;
		this.verticalAngle = verticalAngle;		
		this.#zPos = this.#startZPos;
		this.fov = this.#startFov;
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

	async boost(speedUpTime, maintainingTime, slowDownTime) {
		// Aborting previous animation if any
		this.#animationCancellationToken.abort();
		const cancellationToken = new CancellationToken();
		this.#animationCancellationToken = cancellationToken;

		let [end, endZ] = [110, this.#startZPos*0.8];

		const cancelCondition = () => cancellationToken.isAborted;
		await Promise.all([
			Animations.lerp(fov => this.fov = fov, speedUpTime, this.fov, end, cancelCondition),
			Animations.lerp(z => this.#zPos = z, speedUpTime, this.#zPos, endZ, cancelCondition)
		]);

		await Animations.delay(maintainingTime);

		await Promise.all([
			Animations.lerp(fov => this.fov = fov, slowDownTime, this.fov, this.#startFov, cancelCondition),
			Animations.lerp(z => this.#zPos = z, slowDownTime, this.#zPos, this.#startZPos, cancelCondition)
		]);
	}
}

export default Camera;
