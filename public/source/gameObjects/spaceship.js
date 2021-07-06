import { default as GameObject } from "./gameObject.js";
import { DefaultShaderClass } from "../../shaders/shaderClasses.js"

class Spaceship extends GameObject {
	static objFilename = "resources/spaceship/X-WING.obj";
	static textureFilename = "resources/spaceship/X-Wing-Colors.png";
	static shaderClass = new DefaultShaderClass();
	_materialColor = [0.5, 0.5, 0.5];

	// engine events
	update() {
		this.orientation[0] += 0.5;
		this.orientation[1] += 1.0;
		this.orientation[2] += 1.5;
	}
}

export default Spaceship;
