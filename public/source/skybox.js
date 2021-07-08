import {default as GameObject} from "./gameObjects/gameObject.js";
import {default as utils} from "./utils.js";

class Skybox extends GameObject {
	#gameSettings;

	constructor(gameSettings) {
		super();
		this.#gameSettings = gameSettings;
		this.position = gameSettings.skyboxDefaultPosition.slice();
	}

	static getFaceInfos(gl) {
		return [
			{
				target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
				url: "resources/skybox/posx.png",
			},
			{
				target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
				url: "resources/skybox/negx.png",
			},
			{
				target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
				url: "resources/skybox/posy.png",
			},
			{
				target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
				url: "resources/skybox/negy.png",
			},
			{
				target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
				url: "resources/skybox/posz.png",
			},
			{
				target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
				url: "resources/skybox/negz.png",
			},
		];
	}

	// take into account the camera position
	worldMatrix(camera) {
		const newPosition = [];
		for (let i = 0; i < this.position.length; i++) {
			newPosition[i] = this.position[i] + camera.position[i] * this.#gameSettings.skyboxParallaxFactor;
		}

		return utils.MakeWorld(newPosition[0], newPosition[1], newPosition[2], this.orientation[0], this.orientation[1], this.orientation[2], this.scale);
	}

	update(frameCount) {
		super.update();
		const t = frameCount * this.#gameSettings.skyboxOscillatingSpeed * this.#gameSettings.gameSpeed / this.#gameSettings.fpsLimit;
		// take the fractional part of t, them map it from [0,1) to [-1,1] and then take the absolute value (so it oscillates from 1 to 0) and finally back to [-0.5,0.5]
		const delta = Math.sin(t);
		this.position[1] = this.#gameSettings.skyboxDefaultPosition[1] + delta * this.#gameSettings.skyboxTwoTimesMaxOscillation;
	}


}

export default Skybox;