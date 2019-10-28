import {Table} from '../../vpx-js/dist/lib/vpt/table/table'
import {Ball} from '../../vpx-js/dist/lib/vpt/ball/ball'
import Worker from 'worker-loader!./player.worker.js';


export class PlayerController {

	/**
	 * @param {Blob} blob
	 * @param {Table} table
	 * @param {Renderer} renderer
	 * @param {} renderApi
	 */
	constructor(blob, table, renderer, renderApi) {

		this.sceneItems = {};
		this.tableItems = {};

		this.table = table;
		this.scene = renderer.scene;
		this.renderApi = renderApi;
		this.renderer = renderer;
		this.worker = new Worker();
		this.worker.postMessage({ blob });
		this.worker.onmessage = this._onMessage.bind(this);

		// index scene items
		const playfield = this.scene.children.find(c => c.name === 'playfield');
		if (playfield) {
			for (const itemGroup of playfield.children) {
				for (const item of itemGroup.children) {
					this.sceneItems[item.name] = item;
				}
			}
		}

		// index table items
		for (const item of table.getRenderables()) {
			this.tableItems[item.getName()] = item;
		}

		// index public apis
		window.vpw.items = table.getElementApis();
		window.vpw.player = this._player;
		window.vpw.sceneItems = this.sceneItems;
		window.vpw.tableItems = this.tableItems;
	}

	_onMessage(e) {
		if (e.data.states) {
			this._updateState(e.data.states);
			this.renderer.render();
			return;
		}
		switch (e.data.event) {
			case 'ballCreated': {
				console.log('Created ball:', e.data);
				const ball = new Ball(e.data.data, e.data.state, 0, null, this.table);
				const name = ball.getName();
				ball.addToScene(this.scene, this.renderApi, this.table).then(mesh => {
					this.sceneItems[name] = mesh;
					this.tableItems[name] = ball;
					ball.getUpdater().applyState(mesh, e.data.state, this.renderApi, this.table);
				});
				this.ballName = ball.getName();
				break;
			}
			case 'ballDestroyed': {
				const ball = this.tableItems[e.data.name];
				console.log('Destroyed ball:', ball);
				delete this.sceneItems[ball.getName()];
				delete this.tableItems[ball.getName()];
				ball.removeFromScene(this.scene, this.renderApi);
				this.ballName = undefined;
				break;
			}
		}
	}

	popStates() {
		this.worker.postMessage({ event: 'popStates' });
	}

	keyDown(event) {
		this.worker.postMessage({ event: 'keyDown', data: { code: event.code, key: event.key, ts: Date.now() } });
	}

	keyUp(event) {
		this.worker.postMessage({ event: 'keyUp', data: { code: event.code, key: event.key, ts: Date.now() } });
	}

	// leftFlipperKeyDown() {
	// 	this.keyDownTime = performance.now();
	// 	this.worker.postMessage({event: 'leftFlipperKeyDown'});
	// 	return true;
	// }
	//
	// leftFlipperKeyUp() {
	// 	this.worker.postMessage({event: 'leftFlipperKeyUp'});
	// 	return true;
	// }
	//
	// rightFlipperKeyDown() {
	// 	this.keyDownTime = performance.now();
	// 	this.worker.postMessage({event: 'rightFlipperKeyDown'});
	// 	return true;
	// }
	//
	// rightFlipperKeyUp() {
	// 	this.worker.postMessage({event: 'rightFlipperKeyUp'});
	// 	return true;
	// }
	//
	// plungerKeyDown() {
	// 	this.worker.postMessage({event: 'plungerKeyDown'});
	// 	return true;
	// }
	//
	// plungerKeyUp() {
	// 	this.worker.postMessage({event: 'plungerKeyUp'});
	// 	return true;
	// }

	createBall() {
		const ball = this._player.createBall(this.table.kickers.BallRelease);
	}

	/**
	 * Updates the scene according to the changed states.
	 * @private
	 */
	_updateState(states) {

		// if (this.ballName && !Object.keys(states).includes(this.ballName)) {
		// 	console.warn('Ball did not move!');
		// }
		for (const name of Object.keys(states)) {
			if (!this.sceneItems[name]) {
				//console.warn('No scene item called %s found!', name, states);
				continue;
			}
			if (!this.tableItems[name]) {
				console.warn('No table item called %s found!', name, states);
				continue;
			}

			if (this.keyDownTime) {
				const lat = performance.now() - this.keyDownTime;
				//console.debug('[Latency] = %sms', Math.round(lat * 1000) / 1000);
				this.keyDownTime = undefined;
			}
			const tableItem = this.tableItems[name];
			const sceneItem = this.sceneItems['light:' + name] || this.sceneItems[name];
			tableItem.getUpdater().applyState(sceneItem, states[name], this.renderApi, this.table);
		}
	}
}
