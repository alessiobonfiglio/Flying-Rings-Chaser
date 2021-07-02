import {default as utils} from "/source/utils.js"

class GameObject // should be an abstract class if js allows that
{
    // Property position = pivot world coordinates
    position = [0,0,0];
    scale = [1,1,1];
    orientation = [0,0,0]; // [rx, ry, rz]

    // Geometry    
    get vertices()
    {
        return this._vertices;
    }

    get indices()
    {
        return this._indices;
    }


    worldMatrix()
    {        
        var scaleMat = utils.MakeScaleNuMatrix(this.scale[0], this.scale[1], this.scale[2]);
        var worldMatWithNoScale  = utils.MakeWorld(this.position[0], this.position[1], this.position[2], this.orientation[0], this.orientation[1], this.orientation[2], 1);
        var ret = utils.multiplyMatrices(worldMatWithNoScale, scaleMat);

        return ret;
    }
}

export default GameObject;