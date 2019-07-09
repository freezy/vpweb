
export class Controller {

	/**
	 * @param {Renderer} renderer
	 */
	constructor(renderer) {
		this.renderer = renderer;
	}

	key(event) {
		//console.warn('%s %s, ctrl: %s, shift: %s', event.code, event.type, event.ctrlKey, event.shiftKey);
		if (!this.renderer.physics) {
			return true;
		}
		if (!this.physics) {
			this.physics = this.renderer.physics;
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
