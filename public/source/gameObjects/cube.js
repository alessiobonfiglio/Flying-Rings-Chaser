import {default as GameObject} from "./gameObject.js"

class Cube extends GameObject {
    static sourceFile = 'resources/cube/cube.obj';
    static textureFile = 'resources/cube/crate.png';
    _materialColor = [0.5, 0.5, 0.5];
}

export default Cube;
