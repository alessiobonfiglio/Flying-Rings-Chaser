import { default as utils } from "../utils.js"
import { default as MathUtils } from "../math_utils.js"
import { default as Event } from "../utils/event.js"

class GameObject // should be an abstract class if js allows that
{
	// events
	destroyed = new Event();

	// variables
	position = [0, 0, 0]; //pivot in world coordinates
	scale = 1;
	orientation = [0, 0, 0]; // [rx, ry, rz]
	collider;

	get localCenterOfGravity() {
		return [0, 0, 0];
	}

	get center() {
		return MathUtils.sum(this.position, MathUtils.mul(this.scale, this.localCenterOfGravity)); // Isometry + scaling, scales distances
	}

	set center(value) {
		this.position = MathUtils.sub(value, MathUtils.mul(-this.scale, this.localCenterOfGravity)); // Isometry + scaling, scales distances
	}

	// Color
	get materialColor() {
		return this._materialColor;
	}

	// protected
	static _computeCenterOfGravity(objModel) {
		let totVerices = 0;
		let ret = [0, 0, 0];
		for (const v of this.#verticesFromObj(objModel.vertices))
			if (v[0] && v[1] && v[2]) {
				ret = MathUtils.sum(ret, v);
				totVerices++;
			}

		ret = MathUtils.mul(1 / totVerices, ret);
		return ret;
	}

	static _computeRadius(objModel, center) {
		let radius = 0;
		for (var v of this.#verticesFromObj(objModel.vertices)) {
			let distance = MathUtils.distance(v, center);
			if (distance > radius)
				radius = distance;
		}

		return radius;
	}

	static * #verticesFromObj(vertices) {
		for (let i = 0; i < vertices.length; i += 3)
			yield [vertices[i], vertices[i + 1], vertices[i + 2]];
	}

	// engine events handlers
	update() {
		if (this.collider)
			this.bindCollider();
	}

	bindCollider() {
		this.collider.center = this.center;
		this.collider.scale = this.scale;
		this.collider.orientation = this.orientation;
	}

	// public methods
	worldMatrix() {
		return utils.MakeWorld(this.position[0], this.position[1], this.position[2], this.orientation[0], this.orientation[1], this.orientation[2], this.scale);
	}

	localToWorld(local) {
		return MathUtils.multiplyMatrixVector(this.worldMatrix(), local);
	}

	destroy() {
		this.destroyed.invoke(this);
	}
}

export default GameObject;
