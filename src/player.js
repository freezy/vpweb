import {Table} from '../../vpx-js/dist/lib/vpt/table/table'
import {Ball} from '../../vpx-js/dist/lib/vpt/ball/ball'
import Worker from 'worker-loader!./player.worker.js';

const CANVAS_HEIGHT = 96;
const CANVAS_WIDTH = 384;
const GRID_SIZE = 3;
const KOL = [
	'rgb(64,10,0)',
	'rgba(129,37,0,0.83)',
	'rgb(152,47,0)',
	'rgb(255,68,0)',
];

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

		const canvas = document.getElementById('dmd');
		canvas.setAttribute('style', 'display:block');
		this.canvasContext = canvas.getContext('2d');
	}

	_onMessage(e) {
		if (e.data.states) {
			this._updateState(e.data.states);
			this.renderer.render();
			return;
		}
		if (e.data.dmd) {
			this._updateDmd(e.data.dmd, e.data.dim);
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
			const sceneItem = this.sceneItems[name];
			tableItem.getUpdater().applyState(sceneItem, states[name], this.renderApi, this.table);
		}
	}

	_updateDmd(frame, dim) {
		this.canvasContext.fillStyle = 'black';
		this.canvasContext.fillRect(0, 0, CANVAS_WIDTH + 2, CANVAS_HEIGHT + 2);
		let offsetX = 1;
		let offsetY = 1;
		let color = 0;
		for (let i = 0; i < frame.length; i++) {
			if (frame[i] > 0) {
				if (color !== frame[i]) {
					color = frame[i];
					this.canvasContext.fillStyle = KOL[color];
				}
				this.canvasContext.fillRect(
					offsetX * GRID_SIZE,
					offsetY * GRID_SIZE,
					GRID_SIZE,
					GRID_SIZE
				);
			}
			offsetX++;
			if (offsetX === dim._x) {
				offsetX = 0;
				offsetY++;
			}
		}
	}
}
