
export class Controller {

	/**
	 * @param {Renderer} renderer
	 */
	constructor(renderer) {
		this.renderer = renderer;
	}

	key(event) {
		//console.warn('%s %s, ctrl: %s, shift: %s', event.code, event.type, event.ctrlKey, event.shiftKey);
		if (!this.renderer.player) {
			return true;
		}
		if (!this.physics) {
			this.physics = this.renderer.player;
		}
		const down = event.type === 'keydown';
		switch (event.code) {

			case 'ControlLeft':
			case 'ShiftLeft':
				return down ? this.physics.leftFlipperKeyDown() : this.physics.leftFlipperKeyUp();

			case 'ControlRight':
			case 'ShiftRight':
				return down ? this.physics.rightFlipperKeyDown() : this.physics.rightFlipperKeyUp();

			case 'Enter':
				return down ? this.physics.plungerKeyDown() : this.physics.plungerKeyUp();

			case 'KeyB':
				if (down) {
					return this.physics.createBall();
				}

			default:
				console.log(event.type, event.code);
				break;
		}
		return false;
	}
}
