import {default as utils} from "../utils.js"
import { default as MathUtils } from "../math_utils.js"
import GameObject from "./gameObject.js";
import CancellationToken from "../utils/cancellationToken.js";
import Animations from "../utils/animations.js";
import noise from "../utils/noise.js"


class Camera extends GameObject {
	position = [0, 0, 0];
	horizontalAngle;
	verticalAngle;
	#cockpit;
	#zPos;
	#startZPos = 0.65;
	#startFov = 90;

	fov;
	#animationCancellationToken = new CancellationToken();
	#animatingPosition = false;

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
		if(!this.#animatingPosition)
			this.position = this.#computeCurrentPosition();
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

		await Animations.delay(maintainingTime);

		await Promise.all([
			Animations.lerp(fov => this.fov = fov, slowDownTime, this.fov, this.#startFov, cancelCondition),
			Animations.lerp(z => this.#zPos = z, slowDownTime, this.#zPos, this.#startZPos, cancelCondition)
		]);
	}


	async tilt() {
		const animationLength = MathUtils.getRandomInRange(3, 2);

		const fovAnimation = async () =>  {
			this.#animationCancellationToken.abort();
			const cancellationToken = new CancellationToken();
			this.#animationCancellationToken = cancellationToken;

			const cancelCondition = () => cancellationToken.isAborted;
			const [end, endZ] = [85, this.#startZPos * 1.1];
			await Promise.all([
				Animations.lerp(fov => this.fov = fov, 3*animationLength, this.fov, end, cancelCondition),
				Animations.lerp(z => this.#zPos = z, 3*animationLength, this.#zPos, endZ, cancelCondition)
			]);
			
			await Promise.all([
				Animations.lerp(fov => this.fov = fov, 1*animationLength, this.fov, this.#startFov, cancelCondition),
				Animations.lerp(z => this.#zPos = z, 1*animationLength, this.#zPos, this.#startZPos, cancelCondition)
			]);
		}

		const angleAnimation = async () => {
			const startAngle = this.verticalAngle;
			const deltaRotation = 2+ MathUtils.getRandomInRange(-2, 2);

			await Animations.lerp(angle => this.verticalAngle = angle, animationLength, this.verticalAngle, startAngle + deltaRotation);
			await Animations.lerp(angle => this.verticalAngle = angle, 2* animationLength, this.verticalAngle, startAngle - deltaRotation);
			await Animations.lerp(angle => this.verticalAngle = angle, animationLength, this.verticalAngle, startAngle);		
		}


		const tiltAnimation = async () => {
			this.#animatingPosition = true;
			const startPos = this.position;			
			const [startAngle, endAngle] = [0,2 * Math.PI];									
			const curNoiseX = angle => noise.simplex2(Math.cos(angle), 2* Math.sin(angle)) - 0.5;
			const curNoiseY = angle => noise.simplex2(2 * Math.cos(angle), Math.sin(angle)) - 0.5;
			
			await Promise.all([
				
				Animations.lerp(angle => this.position = MathUtils.sum(this.#computeCurrentPosition(), MathUtils.mul(0.1, [curNoiseX(angle), curNoiseY(angle), 0])),
								animationLength, startAngle, endAngle),
			]);
			
			this.#animatingPosition = false;
		}		

		await Promise.all([tiltAnimation(), fovAnimation()]);
	}

	#computeCurrentPosition() {
		return MathUtils.sum(this.#cockpit.position, [0, -0.125, -this.#zPos]);
	}
}

export default Camera;
