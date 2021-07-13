import { default as MathUtils } from "../math_utils.js"
import {default as Collider} from "./collider.js"

class SphericalCollider extends Collider {
    radius;    
    get scaledRadius() {
        return this.radius * this.scale;
    }


    isInside(point) {
        return MathUtils.distance(point, this.center) <= this.scaledRadius;
    }


    intersectWithCircle(circleCollider) {      
        // Fast check (sufficient condition). far colliders
        if (MathUtils.distance(this.center, circleCollider.center) > this.scaledRadius + circleCollider.scaledRadius)
            return false;
        
        console.log(circleCollider.currentNormal);

        // close colliders
        let Cc = circleCollider.center;
        let Cs = this.center;
        let n = circleCollider.currentNormal;
        // <Cc - x, n> = 0 
        // x = Cs + tn
        // <Cc - Cs - tn, n> = <Cc - Cs,n> - t<n, n> = 0 -> t = <Cc - Cs, n> / |n|^2 = <Cc - Cs, n>


        let t = MathUtils.dot(MathUtils.sub(Cc, Cs), n)
        let x = MathUtils.sum(Cs, MathUtils.mul(t, n));
        
        // let v = Cc - x;
        // if they intersect, then one of the following point is an intersection:
        // {x, Cc + rv, Cc - rv}     

        const checkInside = p => this.isInside(p) && circleCollider.isInside(p);
        if (checkInside(x))
            return true;
        var v = MathUtils.normalize(MathUtils.sub(Cc, x));
        x = MathUtils.sum(Cc, MathUtils.mul(circleCollider.scaledRadius, v));
        if (checkInside(x))
            return true;

        x = MathUtils.sum(Cc, MathUtils.mul(-circleCollider.scaledRadius, v));
        if (checkInside(x))
            return true;
        return false;
    }


    intersectWithSphere(sphericalCollider) {
        return MathUtils.distance(this.center, sphericalCollider.center) <= this.scaledRadius + sphericalCollider.scaledRadius;
    }


    intersectWithBox(boxCollider) {
        let max = MathUtils.sum(boxCollider.position, boxCollider.size);
        let min = MathUtils.sub(boxCollider.position, boxCollider.size);
        // get box closest point to sphere center by clamping
        let x = Math.max(min[0], Math.min(this.position[0], max[0]));
        var y = Math.max(min[1], Math.min(this.position[1], max[1]));
        var z = Math.max(min[2], Math.min(this.position[2], max[2]));    

        return MathUtils.distance([x,y,z], this.center) < this.scaledRadius;
    }
}

export default SphericalCollider;
