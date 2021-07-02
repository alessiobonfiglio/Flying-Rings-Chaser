import {default as utils} from "/source/utils.js"

class Camera
{
    position = [0,0,0];
    horizontalAngle;
    verticalAngle;

    viewMatrix()
    {
        var ret = utils.MakeView(this.position[0], this.position[1], this.position[2], this.horizontalAngle, this.verticalAngle);
        return ret;
    }
}

export default Camera;