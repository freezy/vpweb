import Worker from 'worker-loader!./physics.worker.js';
import {FlipperState} from '../../vpx-toolbox/dist/lib/vpt/flipper/flipper-state'

export class Physics {

	/**
	 * @param {Table} table
	 * @param {Scene} scene
	 */
	constructor(table, scene) {
		this.table = table;
		this.scene = scene;
		this.worker = new Worker();
		this.worker.postMessage({ table });
		this.worker.onmessage = this._onMessage.bind(this);

		this.sceneItems = {};
		this.tableItems = {};

		const playfield = this.scene.children.find(c => c.name === 'playfield');
		if (playfield) {
			const flippers = playfield.children.find(c => c.name === 'flippers');
			if (flippers) {
				for (const flipper of flippers.children) {
					this.sceneItems[flipper.name] = flipper;
					flipper.matrixAutoUpdate = false;
				}
			}
		}

		for (const name of Object.keys(table.flippers)) {
			this.tableItems[name] = table.flippers[name];
		}
	}


	leftFlipperKeyDown() {
		this.worker.postMessage({event: 'leftFlipperKeyDown'});
	}

	leftFlipperKeyUp() {
		this.worker.postMessage({event: 'leftFlipperKeyUp'});
	}

	rightFlipperKeyDown() {
		this.worker.postMessage({event: 'rightFlipperKeyDown'});
	}

	rightFlipperKeyUp() {
		this.worker.postMessage({event: 'rightFlipperKeyUp'});
	}

	_onMessage(e) {
		if (e.data.state) {
			this._updateState(e.data.state);
		}
	}

	_updateState(state) {
		for (const name of Object.keys(state)) {
			if (!this.sceneItems[name]) {
				console.warn('No scene item called %s found!', name);
				break;
			}
			if (!this.tableItems[name]) {
				console.warn('No table item called %s found!', name);
				break;
			}

			const itemState = FlipperState.fromSerialized(state[name]);
			const tableItem = this.tableItems[name];
			const sceneItem = this.sceneItems[name];

			const matrix = tableItem.updateState(itemState);
			if (matrix) {
				sceneItem.applyMatrix(matrix);
			}
		}
	}

}
