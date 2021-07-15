import {default as utils } from "../utils.js"
import { default as MathUtils } from "../math_utils.js"

class Collider {
    center = [0,0,0];
    scale = 1;
    orientation = [0,0,0]
    isEnabled = true;

    // Protected
    _currentOrientation(v) {
		const R = utils.MakeRotateXYZMatrix(this.orientation[0], this.orientation[1], this.orientation[2]);
		return MathUtils.multiplyMatrixVector(R, v);
    }
}

export default Collider;
