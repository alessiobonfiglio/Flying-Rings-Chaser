import { default as GameObject } from "./gameObject.js";
import { default as SemispaceCollider } from "../colliders/semispaceCollider.js"

class TerrainCollider extends GameObject {

    #cockpit;
    #gameSettings

    constructor() {
        super();        
        this.isVisible = false;
        this.collider = new SemispaceCollider();
		this.collider.normal = [0,-1,0]; 
    }

    initialize(cockpit, gameSettings) {
        this.#cockpit = cockpit;
        this.#gameSettings = gameSettings;  
        this.update();
    }

    get localCenterOfGravity() {
        return [0,0,0];
    }
    
    update() {        
        super.update();
        this.center = [0, -this.#gameSettings.maxHalfY - this.#cockpit.collider.scaledRadius/2, 0]; 
    }
}

export default TerrainCollider;