import {default as GameObject} from "./gameObject.js"
import {DefaultShaderClass} from "../../shaders/shaderClasses.js";

class Cube extends GameObject {
	static objFilename = "resources/cube/cube.obj";
	static textureFilename = "resources/cube/crate.png";
	static shaderClass = new DefaultShaderClass();
	_materialColor = [0.5, 0.5, 0.5];	
}

export default Cube;
