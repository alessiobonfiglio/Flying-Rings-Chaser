import { default as MathUtils } from "../math_utils.js"
import {default as utils } from "../utils.js"
import { default as Collider } from "./collider.js"

class CircleCollider extends Collider{
    radius;
    get scaledRadius() {
        return this.radius * this.scale;
    }
    thickness; // to avoid "teleporting" problems at high speed

    // normal to the circle
    #normal = [0,0,1];
    set normal(v) {
        this.#normal = MathUtils.normalize(v);
    }
    get normal() {
        return this.#normal;
    }

    get currentNormal() {
        let R = utils.MakeRotateXYZMatrix(this.orientation[0], this.orientation[1], this.orientation[2]);
        var ret = MathUtils.multiplyMatrixVector(R, this.#normal);
        return ret;
    }

    get currentthickness() {
        return this.thickness * this.scale;
    }



    isInside(point) {
        // check if is too far from the plane that contains the circle
        let deltaPos = MathUtils.sub(point, this.center);
        let dot = MathUtils.dot(deltaPos, this.currentNormal);        

        if(dot > this.thickness || dot < -this.currentthickness)
            return false;

        // check if is inside the circle
        let newCenter = MathUtils.sum(this.center, MathUtils.mul(dot, this.currentNormal));
        var distance = MathUtils.distance(newCenter, point);
        return distance <= this.scaledRadius;
    }           
}

export default CircleCollider;  