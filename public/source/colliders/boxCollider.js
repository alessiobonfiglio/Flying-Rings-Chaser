import { default as Collider } from "./collider.js"

class BoxCollider extends Collider {
    size = [1,1,1];  // half of the size in x y z direction
    orientation = [0,0,0];
}
