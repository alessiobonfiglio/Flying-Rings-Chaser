import { default as MathUtils } from "../math_utils.js"
import { default as Collider } from "./collider.js"

class CircleCollider extends Collider{
    radius;
    get scaledRadius() {
        return this.radius * this.scale;
    }
    thickness; // to avoid "teleporting" problems at high speed

    // normal to the circle
    #normal;
    set normal(v) {
        this.#normal = MathUtils.normalize(v);
    }
    get normal() {
        return this.#normal;
    }

    isInside(point) {
        // check if is too far from the plane that contains the circle
        let deltaPos = MathUtils.sub(point, this.center);
        let dot = MathUtils.dot(deltaPos, this.#normal);        

        if(dot > this.thickness || dot < -this.thickness)
            return false;

        // check if is inside the circle
        let newCenter = MathUtils.sum(this.center, MathUtils.mul(dot, this.#normal));
        var distance = MathUtils.distance(newCenter, point);
        return distance <= this.scaledRadius;
    }           
}

export default CircleCollider;  