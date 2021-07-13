import {default as GameObject} from "./gameObject.js";
import {TerrainShaderClass} from "../../shaders/shaderClasses.js";


class Terrain extends GameObject {
	static textureFilename = "resources/terrain/terrain.png";
	static shaderClass = new TerrainShaderClass();

	#gameSettings;
	rowNumber;

	static meshGenerator(gameSettings) {
		const res = gameSettings.terrainChunkResolution;
		const maxXZ = gameSettings.terrainChunkSize;

		const vert = [];
		const uv = [];
		const ind = [];
		let vertexPointer = 0;
		for (let i = 0; i < res; i++) {
			for (let j = 0; j < res; j++) {
				vert[vertexPointer * 3] = j * maxXZ / (res - 1);
				vert[vertexPointer * 3 + 1] = -gameSettings.maxHalfY - 12.0;
				vert[vertexPointer * 3 + 2] = i * maxXZ / (res - 1);
				uv[vertexPointer * 2] = j / (res - 1);
				uv[vertexPointer * 2 + 1] = i / (res - 1);
				vertexPointer++;
			}
		}
		let pointer = 0;
		for (let i = 0; i < res - 1; i++) {
			for (let j = 0; j < res - 1; j++) {
				const topLeft = (i * res) + j;
				const topRight = topLeft + 1;
				const bottomLeft = ((i + 1) * res) + j;
				const bottomRight = bottomLeft + 1;
				ind[pointer++] = topLeft;
				ind[pointer++] = bottomLeft;
				ind[pointer++] = topRight;
				ind[pointer++] = topRight;
				ind[pointer++] = bottomLeft;
				ind[pointer++] = bottomRight;
			}
		}

		return {indices: ind, vertices: vert, textures: uv}
	}

	constructor(gameSettings) {
		super();
		this.#gameSettings = gameSettings;
	}

	// events
	update() {
		super.update();
		this.position[2] -= this.#gameSettings.terrainSpeed * this.#gameSettings.deltaT;
		const newZ = ((this.position[2] - this.#gameSettings.terrainChunkSize) % (this.#gameSettings.terrainChunkSize * this.#gameSettings.numberTerrainChunksRows)) + this.#gameSettings.terrainChunkSize;
		if (newZ > this.position[2]){
			this.rowNumber += this.#gameSettings.numberTerrainChunksRows;
		}
		this.position[2] = newZ;
	}
}

export default Terrain;
