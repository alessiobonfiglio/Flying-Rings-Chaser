import { DefaultShaderClass } from "../../shaders/shaderClasses.js";
import GameObject from "./gameObject.js";

class Square extends GameObject{
    static shaderClass = new DefaultShaderClass();
    static textureFilename = "resources/cube/crate.png";
    scale = 3;


    static meshGenerator(gameSettings) {
        const vert = [
            -1,1,0,
            -1,-1,0, 
            1, -1, 0,
            1, 1, 0
        ];
        const uv = 
        [
            0,1,
            0,0, 
            1,0,
            1,1
        ];
        const ind = [0,1,2, 2,3,0];        
        return {indices: ind, vertices: vert, textures: uv}
    }
}

export default Square;