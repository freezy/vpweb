
export class Controller {

	/**
	 * @param {Loader} loader
	 */
	constructor(loader) {
		this.loader = loader;
	}

	key(event) {
		//console.warn('%s %s, ctrl: %s, shift: %s', event.code, event.type, event.ctrlKey, event.shiftKey);
		if (!this.loader.physics) {
			return true;
		}
		if (!this.physics) {
			this.physics = this.loader.physics;
		}
		const down = event.type === 'keydown';
		switch (event.code) {

			case 'ShiftLeft':
				return down ? this.physics.leftFlipperKeyDown() : this.physics.leftFlipperKeyUp();

			case 'ShiftRight':
				return down ? this.physics.rightFlipperKeyDown() : this.physics.rightFlipperKeyUp();

			default:
				break;
		}
		return false;
	}
}
