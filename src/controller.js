
export class Controller {

	/**
	 * @param {Renderer} renderer
	 */
	constructor(renderer) {
		this.renderer = renderer;
	}

	setCabinetInput(key) {
		if (!this.renderer.player) {
			return;
		}
		this.renderer.player.setCabinetInput(key);
	}

	setInput(key) {
		if (!this.renderer.player) {
			return;
		}
		this.renderer.player.setSwitchInput(key);
	}

	key(event) {
		if (!this.renderer.player) {
			return true;
		}
		if (!this.physics) {
			this.physics = this.renderer.player;
		}

		const down = event.type === 'keydown';
		if (down) {
			this.physics.keyDown(event);
		} else {
			this.physics.keyUp(event);
		}
		return false;
	}
}
