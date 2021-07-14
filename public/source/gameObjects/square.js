import { DefaultShaderClass } from "../../shaders/shaderClasses.js";
import GameObject from "./gameObject.js";

class Square extends GameObject{
    static shaderClass = new DefaultShaderClass();
    static objFilename = "resources/square/square.obj";
    static textureFilename = "resources/cube/crate.png";
    orientation = [0,-90,90];
    scale = 6;

    position = [0,0,30]
}

export default Square;