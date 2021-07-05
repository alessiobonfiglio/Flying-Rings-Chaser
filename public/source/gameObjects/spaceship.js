import GameObject from "./gameObject.js";

class Spaceship extends GameObject {
	static sourceFile = 'resources/spaceship/X-WING.obj';
	static textureFile = 'resources/spaceship/X-Wing-Colors.png';
	_materialColor = [0.5, 0.5, 0.5];
}

export default Spaceship;
