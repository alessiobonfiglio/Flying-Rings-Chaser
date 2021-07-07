import { default as Collider } from "./collider.js"
import { default as MathUtils } from "../math_utils.js"


class SemispaceCollider extends Collider {
    #normal = [0,1,0];
    set normal(v) {
        this.#normal = MathUtils.normalize(v);
    }
    get normal() {
        return this.#normal;
    }

    get currentNormal() {
        return this._currentOrientation(this.normal);
    }


    get currentNormal() {
       return this._currentOrientation(this.normal);
    }

    intersectWithSphere(sphericalCollider) {
        const Pc = this.center;        
        const n = this.currentNormal;
        const c = sphericalCollider.center;

        // Plane: <n, x - Pc> = 0
        // Line: tn + c
        // --> <n, tn + c - Pc> = 0 --> t + <n,c - Pc> = 0 --> t = <Pc - c, n> 
        // x = <Pc - c, n>n + c  --> x - c = <Pc - c,n>

        const distance = MathUtils.dot(MathUtils.sub(Pc, c), n);
        return distance <= sphericalCollider.scaledRadius;
    }

}

export default SemispaceCollider;