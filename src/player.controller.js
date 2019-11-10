//import {GUI} from 'three/examples/jsm/libs/dat.gui.module';
import {Ball} from 'vpx-js';
import Worker from 'worker-loader!./player.worker.js';
import {AdditiveBlending, Color, MultiplyBlending, NoBlending, NormalBlending, SubtractiveBlending} from "three";

const CANVAS_HEIGHT = 98;
const CANVAS_WIDTH = 388;
const GRID_SIZE = 3;
const KOL = [
	'rgb(64,10,0)',
	'rgba(129,37,0,0.83)',
	'rgb(152,47,0)',
	'rgb(194,62,0)',
];

const BLENDINGS = {
	'none': NoBlending,
	'normal': NormalBlending,
	'additive': AdditiveBlending,
	'subtractive': SubtractiveBlending,
	'multiply': MultiplyBlending,
};

/**
 * This class receives messages from the worker thread and updates the UI.
 *
 * It also creates the worker thread as soon as the blog is uploaded.
 */
export class PlayerController {

	/**
	 * @param {Blob} blob
	 * @param renderApi
	 * @param progressModal
	 */
	constructor(blob, renderApi, progressModal) {

		this.sceneItems = {};
		this.tableItems = {};
		this.messageQueue = [];

		this.renderApi = renderApi;
		this.progressModal = progressModal;
		this.worker = new Worker();
		this.worker.postMessage({ blob });
		this.worker.onmessage = this._onMessage.bind(this);
		this.playfieldLights = [];

		// gui
		this.renderController = {
			'opacity': 1,
			'saturation': 1,
			'lightness': 1.25,
			'emissiveIntensity': 3,
			'blending': 'normal',
		};
		//this._initGUI();
	}

	init(table, renderer) {

		this.table = table;
		this.renderer = renderer;
		this.scene = renderer.scene;

		// index scene items
		const playfield = this.scene.children.find(c => c.name === 'playfield');
		if (playfield) {
			for (const itemGroup of playfield.children) {
				for (const item of itemGroup.children) {
					this.sceneItems[item.name] = item;
				}
				if (itemGroup.name === 'playfieldLights') {
					this.playfieldLights = itemGroup.children.map(c => { c.children[0].itemName = c.name; return c.children[0] });
				}
			}
		}

		// index table items
		for (const item of table.getRenderables()) {
			this.tableItems[item.getName()] = item;
		}

		this._emptyQueue();

		// index public apis
		window.vpw.sceneItems = this.sceneItems;
		window.vpw.tableItems = this.tableItems;
		window.vpw.items = table.getElementApis();
	}

	reset() {
		this.messageQueue = [];
		this.worker.terminate();
		this._hideEmuUI();
		delete window.vpw.sceneItems;
		delete window.vpw.tableItems;
		delete window.vpw.items;
	}

	_onMessage(e) {

		// table element
		if (e.data.states) {
			if (this.messageQueue) {
				this.messageQueue.push([ 'state', e.data.states]);
			} else {
				this._updateState(e.data.states);
				this.renderer.render();
			}
			return;
		}

		// dmd
		if (e.data.dmd) {
			this._updateDmd(e.data.dmd, e.data.dim);
			return;
		}

		// physics loop cycles count
		if (e.data.cpf) {
			if (this.renderer) {
				this.renderer._updateCps(e.data.cpf);
			}
		}

		// ball events
		switch (e.data.event) {
			case 'ballCreated': {
				if (this.messageQueue) {
					this.messageQueue.push([ 'createBall', e.data ]);
				} else {
					this._createBall(e.data);
				}
				break;
			}

			case 'ballDestroyed': {
				if (this.messageQueue) {
					this.messageQueue.push([ 'destroyBall', e.data ]);
				} else {
					this._destroyBall(e.data);
				}
				break;
			}

			case 'emuStarted': {
				this._showEmuUI();
				break;
			}

			case 'progressStart': {
				this.progressModal.start(e.data.id, e.data.title, true);
				break;
			}
			case 'progressEnd': {
				this.progressModal.end(e.data.id, true);
				break;
			}
			case 'progressShow': {
				this.progressModal.show(e.data.action, e.data.details, true);
				break;
			}
			case 'progressDetails': {
				this.progressModal.details(e.data.details, true);
				break;
			}
		}
	}

	_emptyQueue() {
		for (const msg of this.messageQueue) {
			switch (msg[0]) {
				case 'state':
					this._updateState(msg[1]);
					break;
				case 'createBall':
					this._createBall(msg[1]);
					break;
				case 'destroyBall':
					this._destroyBall(msg[1]);
					break;
			}
		}
		this.messageQueue = null;
	}

	_createBall(data) {
		console.log('Created ball:', data);
		const ball = new Ball(data.id, data.data, data.state, 0, null, this.table);
		const name = ball.getName();
		ball.addToScene(this.scene, this.renderApi, this.table).then(mesh => {
			this.sceneItems[name] = mesh;
			this.tableItems[name] = ball;
			ball.getUpdater().applyState(mesh, data.state, this.renderApi, this.table);
		});
		this.ballName = ball.getName();
	}

	_destroyBall(data) {
		const ball = this.tableItems[data.name];
		console.log('Destroyed ball:', ball);
		delete this.sceneItems[ball.getName()];
		delete this.tableItems[ball.getName()];
		ball.removeFromScene(this.scene, this.renderApi);
		this.ballName = undefined;
	}

	onFrame() {
		this.worker.postMessage({ event: 'onFrame' });
	}

	keyDown(event) {
		this.worker.postMessage({ event: 'keyDown', data: { code: event.code, key: event.key, ts: Date.now() } });
	}

	keyUp(event) {
		this.worker.postMessage({ event: 'keyUp', data: { code: event.code, key: event.key, ts: Date.now() } });
	}

	setCabinetInput(keyNr) {
		this.worker.postMessage({ event: 'setCabinetInput', data: { keyNr } });
	}

	setSwitchInput(switchNr, optionalEnableSwitch) {
		this.worker.postMessage({ event: 'setSwitchInput', data: { switchNr, optionalEnableSwitch } });
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

	_showEmuUI() {
		// init dmd
		const canvas = document.getElementById('dmd');
		canvas.setAttribute('style', 'display:block');
		this.canvasContext = canvas.getContext('2d');

		// show buttons
		const buttons = document.getElementById('emu-buttons');
		buttons.setAttribute('style', 'display:block');
	}

	_hideEmuUI() {
		// init dmd
		const canvas = document.getElementById('dmd');
		canvas.removeAttribute('style');
		this.canvasContext = null;

		// show buttons
		const buttons = document.getElementById('emu-buttons');
		buttons.removeAttribute('style');
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
			if (offsetX > dim._x) {
				offsetX = 1;
				offsetY++;
			}
		}
	}

	_guiChanged() {
		for (const pfl of this.playfieldLights) {
			const item = vpw.tableItems[pfl.itemName];
			const color = new Color(item.data.color);

			const hsl = {};
			color.getHSL(hsl);
			color.setHSL(hsl.h, hsl.s * this.renderController.saturation, hsl.l * this.renderController.lightness);

			pfl.material.opacity = this.renderController.opacity;
			pfl.material.intensity = this.renderController.intensity;
			pfl.material.emissiveIntensity = this.renderController.emissiveIntensity;
			pfl.material.emissive = color;
			pfl.material.blending = BLENDINGS[this.renderController.blending];
			pfl.material.needsUpdate = true;
		}
	}

	// _initGUI() {
	// 	const gui = new GUI();
	// 	gui.add(this.renderController, 'opacity', 0, 1, 0.005).onChange(this._guiChanged.bind(this));
	// 	gui.add(this.renderController, 'saturation', 0, 2, 0.01).onChange(this._guiChanged.bind(this));
	// 	gui.add(this.renderController, 'lightness', 0, 2, 0.01).onChange(this._guiChanged.bind(this));
	// 	gui.add(this.renderController, 'emissiveIntensity', 0, 10, 0.1).onChange(this._guiChanged.bind(this));
	// 	gui.add(this.renderController, 'blending', Object.keys(BLENDINGS)).onChange(this._guiChanged.bind(this));
	// 	this._guiChanged();
	// }
}
