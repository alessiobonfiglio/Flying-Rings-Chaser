import {default as utils} from "./utils.js"

let math_utils = {

	getRandomInRange: function (min, max) {
		return Math.random() * (max - min) + min;
	},

	sum: function (v, w) {
		return [v[0] + w[0], v[1] + w[1], v[2] + w[2]];
	},

	sub: function(v, w) {
		return  [v[0] - w[0], v[1] - w[1], v[2] - w[2]];
	},

	mul: function (alpha, v) {
		return [alpha * v[0], alpha * v[1], alpha * v[2]];
	},

	minus: function (v) {
		return [-v[0], -v[1], -v[2]];
	},

	length: function(v){
		return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
	},

	normalize: function(v){
		return this.mul(1/ this.length(v), v);
	},

	distance: function(v, w) {
		return this.length(this.sub(v, w));
	},

	dot: function(v, w) {
		return v[0] * w[0] + v[1] * w[1] + v[2] * w[2];
	},
	
	multiplyMatrices: function(m1, m2){
		return utils.multiplyMatrices(m1, m2);
	},

	multiplyAllMatrices: function (...matrices){
		return utils.multiplyAllMatrices(...matrices);
	},

	multiplyMatrixVector: function(m, v) {
		var hasThreeComponents = (v[4] == undefined);
		if(hasThreeComponents)
		v = [v[0], v[1], v[2], 1];		
		let ret = utils.multiplyMatrixVector(m, v);		
		return hasThreeComponents ? ret.slice(0, 3) : ret;
	}
}

export default math_utils;