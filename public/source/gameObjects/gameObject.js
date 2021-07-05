import {default as utils} from "../utils.js"

class GameObject // should be an abstract class if js allows that
{
	// Property position = pivot world coordinates
	position = [0, 0, 0];
	scale = 1;
	orientation = [0, 0, 0]; // [rx, ry, rz]

	// Geometry
	get vertices() {
		return this._vertices;
	}

	get normals() {
		return this._normals;
	}

	get texcoords() {
		return this._texcoords;
	}

	get indices() {
		return this._indices;
	}

	// Color
	get materialColor() {
		return this._materialColor;
	}


	worldMatrix() {
		const worldMatWithNoScale = utils.MakeWorld(this.position[0], this.position[1], this.position[2], this.orientation[0], this.orientation[1], this.orientation[2], this.scale);
		return worldMatWithNoScale;
	}
}

export default GameObject;
