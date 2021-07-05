import {default as GameObject} from "./gameObject.js";
import {default as DefaultShaderClass} from "../../shaders/shaderClasses.js"

class Spaceship extends GameObject {
	static objFilename = "resources/spaceship/X-WING.obj";
	static textureFilename = "resources/spaceship/X-Wing-Colors.png";
	static shaderClass = new DefaultShaderClass();
	_materialColor = [0.5, 0.5, 0.5];
}

export default Spaceship;
