import {default as GameObject} from "./gameObject.js"
import {RingShaderClass} from "../../shaders/shaderClasses.js";

class Ring extends GameObject {
	static objFilename = "resources/ring/ring.obj";
	static textureFilename = null;
	static shaderClass = new RingShaderClass();
	_materialColor = [255 / 255, 215 / 255, 0 / 255];
}

export default Ring;