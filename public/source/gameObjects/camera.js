import {default as utils} from "../utils.js"
import {default as MathUtils} from "../math_utils.js"
import GameObject from "./gameObject.js";
import CancellationToken from "../utils/cancellationToken.js";
import Animations from "../utils/animations.js";


class Camera extends GameObject {
	#gameSettings;
	#cockpit;
	#zPos;
	#horizontalAngle;
	#verticalAngle;
	#rollAngle;
	#startZPos = 0.65;
	#startFov = 90;

	fov;
	#animationCancellationToken = new CancellationToken();	

	constructor(position, horizontalAngle, verticalAngle, rollAngle) {
		super();
		this.position = position;
		this.orientation = [horizontalAngle, verticalAngle, rollAngle];
		this.#horizontalAngle = horizontalAngle;
		this.#verticalAngle = verticalAngle;
		this.#rollAngle = rollAngle;
		this.#zPos = this.#startZPos;
		this.fov = this.#startFov;
	}

	initialize(cockpit, gameSettings) {
		this.#cockpit = cockpit;
		this.#gameSettings = gameSettings;
	}

	viewMatrix() {
		return utils.MakeView(this.position[0], this.position[1], this.position[2], -this.orientation[0], this.orientation[1], this.orientation[2]);
	}

	update() {
		this.position = MathUtils.sum(this.#cockpit.position, [0, -0.125, -this.#zPos]);
		this.orientation[0] = this.#cockpit.orientation[0] * this.#gameSettings.cameraOscillationReduction[0] + this.#horizontalAngle;
		this.orientation[1] = this.#cockpit.orientation[1] * this.#gameSettings.cameraOscillationReduction[1] + this.#verticalAngle;
		this.orientation[2] = this.#cockpit.orientation[2] * this.#gameSettings.cameraOscillationReduction[2] + this.#rollAngle;
	}

	async boost(speedUpTime, maintainingTime, slowDownTime) {
		// Aborting previous animation if any
		this.#animationCancellationToken.abort();
		const cancellationToken = new CancellationToken();
		this.#animationCancellationToken = cancellationToken;

		const [end, endZ] = [110, this.#startZPos * 0.8];

		const cancelCondition = () => cancellationToken.isAborted;
		await Promise.all([
			Animations.lerp(fov => this.fov = fov, speedUpTime, this.fov, end, cancelCondition),
			Animations.lerp(z => this.#zPos = z, speedUpTime, this.#zPos, endZ, cancelCondition)
		]);

		await Animations.delay(maintainingTime, cancelCondition);

		await Promise.all([
			Animations.lerp(fov => this.fov = fov, slowDownTime, this.fov, this.#startFov, cancelCondition),
			Animations.lerp(z => this.#zPos = z, slowDownTime, this.#zPos, this.#startZPos, cancelCondition)
		]);
	}


	async tilt() {
		const animationLength = MathUtils.getRandomInRange(0.1, 0.2);

		const fovAnimation = async () => {
			this.#animationCancellationToken.abort();
			const cancellationToken = new CancellationToken();
			this.#animationCancellationToken = cancellationToken;

			const cancelCondition = () => cancellationToken.isAborted;
			const [end, endZ] = [85, this.#startZPos * 1.03];
			await Promise.all([
				Animations.lerp(fov => this.fov = fov, 3 * animationLength, this.fov, end, cancelCondition),
				Animations.lerp(z => this.#zPos = z, 3 * animationLength, this.#zPos, endZ, cancelCondition)
			]);

			await Promise.all([
				Animations.lerp(fov => this.fov = fov, 1 * animationLength, this.fov, this.#startFov, cancelCondition),
				Animations.lerp(z => this.#zPos = z, 1 * animationLength, this.#zPos, this.#startZPos, cancelCondition)
			]);
		}

		const angleAnimation = async () => {
			const startAngle = this.#verticalAngle;
			const deltaRotation = 2 + MathUtils.getRandomInRange(-2, 2);

			await Animations.lerp(angle => this.#verticalAngle = angle, animationLength, this.#verticalAngle, startAngle + deltaRotation);
			await Animations.lerp(angle => this.#verticalAngle = angle, 2 * animationLength, this.#verticalAngle, startAngle - deltaRotation);
			await Animations.lerp(angle => this.#verticalAngle = angle, animationLength, this.#verticalAngle, startAngle);
		}

		await Promise.all([angleAnimation(), fovAnimation()]);
	}
}

export default Camera;
