import { CockpitScreenShaderClass, DefaultShaderClass, NoTextureShaderClass, RingShaderClass } from "../../shaders/shaderClasses.js";
import GameObject from "./gameObject.js";

class Sphere extends GameObject{
    static objFilename = "resources/sphere/sphere.obj";
	static textureFilename = "resources/laser/warp_blue.png";
	static shaderClass = new CockpitScreenShaderClass();
    _materialColor = [0, 44/255, 244/255];
    scale = 1;
}

export default Sphere;