import {default as GameObject} from "./gameObject.js"
import {default as DefaultShaderClass} from "../../shaders/shaderClasses.js";
import {default as MathUtils} from "../math_utils.js";

class Asteroid extends GameObject {
	static objFilename = "resources/asteroids/brown_asteroid.obj";
	static textureFilename = "resources/asteroids/brown.png";
	static shaderClass = new DefaultShaderClass();
	_materialColor = [0.5, 0.5, 0.5];

	speed = 1;
	rotationSpeed = [1, 1, 1];

	initialize(gameConfig) {
		const x = MathUtils.getRandomInRange(-gameConfig.maxHalfX, gameConfig.maxHalfX);
		const y = MathUtils.getRandomInRange(-gameConfig.maxHalfY, gameConfig.maxHalfY);
		const z = MathUtils.getRandomInRange(gameConfig.maxZ * 2 / 3, gameConfig.maxZ);
		this.position = [x, y, z];

		const rx = MathUtils.getRandomInRange(0, 360);
		const ry = MathUtils.getRandomInRange(0, 360);
		const rz = MathUtils.getRandomInRange(0, 360);
		this.orientation = [rx, ry, rz];

		const s = MathUtils.getRandomInRange(gameConfig.asteroidScaleRange[0], gameConfig.asteroidScaleRange[1]);
		this.scale = s;

		const speed = MathUtils.getRandomInRange(gameConfig.asteroidSpeedRange[0], gameConfig.asteroidSpeedRange[1]);
		this.speed = speed;

		const rsx = MathUtils.getRandomInRange(gameConfig.asteroidRotationSpeedRange[0], gameConfig.asteroidRotationSpeedRange[1]);
		const rsy = MathUtils.getRandomInRange(gameConfig.asteroidRotationSpeedRange[0], gameConfig.asteroidRotationSpeedRange[1]);
		const rsz = MathUtils.getRandomInRange(gameConfig.asteroidRotationSpeedRange[0], gameConfig.asteroidRotationSpeedRange[1]);
		this.rotationSpeed = [rsx, rsy, rsz];
	}

	moveForward(gameConfig) {
		this.position[2] -= this.speed * (gameConfig.gameSpeed / gameConfig.fpsLimit);
		if (this.position[2] < 0) {
			this.initialize(gameConfig);
			return;
		}
		this.orientation[0] += (this.rotationSpeed[0] * (gameConfig.gameSpeed / gameConfig.fpsLimit)) % 360;
		this.orientation[1] += (this.rotationSpeed[1] * (gameConfig.gameSpeed / gameConfig.fpsLimit)) % 360;
		this.orientation[2] += (this.rotationSpeed[2] * (gameConfig.gameSpeed / gameConfig.fpsLimit)) % 360;
	}
}

export default Asteroid;