
export class Controller {

	/**
	 * @param {Loader} loader
	 */
	constructor(loader) {
		this.loader = loader;
	}

	keydown(event) {
		if (!this.loader.physics) {
			return;
		}
		if (!this.physics) {
			this.physics = this.loader.physics;
		}
		switch (event.code) {
			case 'ShiftLeft':
				this.physics.leftFlipperKeyDown();
				break;
			case 'ShiftRight':
				this.physics.rightFlipperKeyDown();
				break;
			default:
				break;
		}
	}

	keyup(event) {
		if (!this.loader.physics) {
			return;
		}
		if (!this.physics) {
			this.physics = this.loader.physics;
		}
		switch (event.code) {
			case 'ShiftLeft':
				this.physics.leftFlipperKeyUp();
				break;
			case 'ShiftRight':
				this.physics.rightFlipperKeyUp();
				break;
			default:
				break;
		}
	}
}
