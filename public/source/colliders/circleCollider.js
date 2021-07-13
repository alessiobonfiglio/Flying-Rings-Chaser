import { default as MathUtils } from "../math_utils.js"
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
        return this._currentOrientation(this.normal);
    }

    get currentThickness() {
        return this.thickness * this.scale;
    }



    isInside(point) {
        // check if is too far from the plane that contains the circle
        const deltaPos = MathUtils.sub(point, this.center);
        const dot = MathUtils.dot(deltaPos, this.currentNormal);

        if (dot > this.thickness || dot < -this.currentThickness)
            return false;

        // check if is inside the circle
        const newCenter = MathUtils.sum(this.center, MathUtils.mul(dot, this.currentNormal));
        const distance = MathUtils.distance(newCenter, point);
        return distance <= this.scaledRadius;
    }           
}

export default CircleCollider;
