import Worker from 'worker-loader!./physics.worker.js';

import {FlipperState} from '../../vpx-toolbox/dist/lib/vpt/flipper/flipper-state'

export class Physics {

	constructor(table, scene) {
		this.table = table;
		this.scene = scene;
		this.worker = new Worker();
		this.worker.postMessage({ table });
		this.worker.onmessage = this._onMessage.bind(this);
	}

	_onMessage(e) {

		if (e.data.state) {
			this._updateState(e.data.state);
		}
	}

	_updateState(state) {
		if (state.LeftFlipper) {
			const flipperState = FlipperState.fromSerialized(state.LeftFlipper);
			const flipper = this.table.flippers.LeftFlipper;
			const flipperObj = this.scene.children[3].children[4].children[0];

			const matrix = flipper.updateState(flipperState);
			if (matrix) {
				flipperObj.matrixAutoUpdate = false;
				flipperObj.applyMatrix(matrix);
			}
		}
	}

}
