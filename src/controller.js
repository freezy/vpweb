
export class Controller {

	/**
	 * @param {Renderer} renderer
	 */
	constructor(renderer) {
		this.renderer = renderer;
	}

	setCabinetInput(key) {
		if (!this._setup()) {
			return;
		}
		this.renderer.player.setCabinetInput(key);
	}

	setInput(key) {
		if (!this._setup()) {
			return;
		}
		this.renderer.player.setSwitchInput(key);
	}

	key(event) {
		if (!this._setup()) {
			return true;
		}

		const down = event.type === 'keydown';
		if (down) {
			this.playerController.keyDown(event);
		} else {
			this.playerController.keyUp(event);
		}
		return false;
	}

	pause() {
		this._setup();
		this.playerController.pause();
	}

	resume() {
		this._setup();
		this.playerController.resume();
	}

	_setup() {
		if (!this.renderer.player) {
			return false;
		}
		if (!this.playerController) {
			this.playerController = this.renderer.player;
		}
		return true;
	}
}
