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
	#startFov = 90;
	#boostDuration = 1.2;
	fov;
	#totBosts = 0;
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

	i=0;
	async boost() {
		// Aborting prebious animation if any
		this.#animationCancellationToken.abort();
		const cancellationToken = new CancellationToken();
		this.#animationCancellationToken = cancellationToken;

		let [end, endZ] = [110, this.#startZPos*0.9];		
		
		this.#totBosts++;				
		const totBoost = this.#totBosts;
		console.log("in ", totBoost)	
		const cancelCondition = () => cancellationToken.isAborted;
		await Promise.all([
			this.animation(fov => this.fov = fov, this.#boostDuration/5, this.fov, end, cancelCondition),
			this.animation(z => this.#zPos = z, this.#boostDuration/5, this.#zPos, endZ, cancelCondition)
		]);

		await this.delay(this.#boostDuration);

		console.log("nice")
		await Promise.all([
			this.animation(fov => this.fov = fov, this.#boostDuration/3, this.fov, this.#startFov, cancelCondition),
			this.animation(z => this.#zPos = z, this.#boostDuration/3, this.#zPos, this.#startZPos, cancelCondition)
		]);
		this.#totBosts--
		console.log("out ", totBoost, "canceled: ", cancelCondition())
	}
}

export default Camera;
