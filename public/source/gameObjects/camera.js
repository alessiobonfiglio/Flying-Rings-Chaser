import {default as utils} from "/source/utils.js"

class Camera {
	position = [0, 0, 0];
	horizontalAngle;
	verticalAngle;

	constructor(position, horizontalAngle, verticalAngle) {
		this.position = position;
		this.horizontalAngle = horizontalAngle;
		this.verticalAngle = verticalAngle;
	}

	viewMatrix() {
		return utils.MakeView(this.position[0], this.position[1], this.position[2], this.horizontalAngle, this.verticalAngle);
	}
}

export default Camera;
