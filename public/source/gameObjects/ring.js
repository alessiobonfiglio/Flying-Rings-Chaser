import {default as GameObject} from "./gameObject.js"
import {RingShaderClass} from "../../shaders/shaderClasses.js";

class Ring extends GameObject {
	static objFilename = "resources/ring/ring.obj";
	static textureFilename = null;
	static shaderClass = new RingShaderClass();
	_materialColor = [0.5, 0.5, 0.5];
}

export default Ring;