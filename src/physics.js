import { Math as _M } from 'three';
import Worker from 'worker-loader!./physics.worker.js';

export class Physics {

	constructor(scene) {
		this.scene = scene;
		this.worker = new Worker();
		this.worker.onmessage = this._onMessage.bind(this);
	}

	_onMessage(e) {
		console.log('got message:', e.data)
		this.scene.children[3].children[4].children[0].rotation.set(0, 0, _M.degToRad(e.data.angle));
	}

}
