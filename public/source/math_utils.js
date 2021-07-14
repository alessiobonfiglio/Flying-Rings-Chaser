import {default as utils} from "./utils.js"

const math_utils = {

	getRandomInRange: function (min, max) {
		return Math.random() * (max - min) + min;
	},

	sum: function (v, w) {
		return [v[0] + w[0], v[1] + w[1], v[2] + w[2]];
	},

	sub: function (v, w) {
		return [v[0] - w[0], v[1] - w[1], v[2] - w[2]];
	},

	mul: function (alpha, v) {
		return [alpha * v[0], alpha * v[1], alpha * v[2]];
	},

	minus: function (v) {
		return [-v[0], -v[1], -v[2]];
	},

	length: function (v) {
		return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
	},

	normalize: function (v) {
		return v == [0,0] ? [0,0] : this.mul(1 / this.length(v), v);
	},

	distance: function (v, w) {
		return this.length(this.sub(v, w));
	},

	dot: function (v, w) {
		return v[0] * w[0] + v[1] * w[1] + v[2] * w[2];
	},

	multiplyMatrices: function (m1, m2) {
		return utils.multiplyMatrices(m1, m2);
	},

	multiplyAllMatrices: function (...matrices) {
		return utils.multiplyAllMatrices(...matrices);
	},

	multiplyMatrixVector: function (m, v) {
		const hasThreeComponents = (v[4] == undefined);
		if (hasThreeComponents)
			v = [v[0], v[1], v[2], 1];
		const ret = utils.multiplyMatrixVector(m, v);
		return hasThreeComponents ? ret.slice(0, 3) : ret;
	},
	
	clamp(num, min, max) {
		return Math.min(Math.max(num, min), max);
	},

	randomVersor() {		
		return this.normalize([this.getRandomInRange(-1, 1), this.getRandomInRange(-1, 1), this.getRandomInRange(-1, 1)]);
	}


}

export default math_utils;
