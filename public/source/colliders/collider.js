import {default as utils } from "../utils.js"
import { default as MathUtils } from "../math_utils.js"

class Collider {
    center = [0,0,0];
    scale = 1;
    orientation = [0,0,0]


    // Protected
    _currentOrientation(v) {
        let R = utils.MakeRotateXYZMatrix(this.orientation[0], this.orientation[1], this.orientation[2]);
        var ret = MathUtils.multiplyMatrixVector(R, v);
        return ret;
    }
}

export default Collider;