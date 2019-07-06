import {Flipper} from '../../vpx-toolbox/dist/lib/vpt/flipper/flipper'
import {FlipperData} from '../../vpx-toolbox/dist/lib/vpt/flipper/flipper-data'
import {FlipperState} from '../../vpx-toolbox/dist/lib/vpt/flipper/flipper-state'

class PhysicsWorker {

	constructor() {
		this.fps = 60;
		this.numIterations = 16; // 4 iterations => 240 iterations / s

		this._timePerFrame = 1000 / this.fps; // 16.6ms per frame
		this._timePerIteration = this._timePerFrame / this.numIterations;
		this._angle = 0;
		this._table = null;
		this._interval = null;
		this._state = {};
	}

	start() {
		if (this._interval) {
			throw new Error('Physics loop already started!');
		}
		console.log('[worker] Starting physics loop...');
		this._lastTime = performance.now();
		this._interval = setInterval(this._loop.bind(this), this._timePerFrame);
	}

	stop() {
		if (this._interval) {
			clearInterval(this._interval);
		}
		console.log('[worker] Physics loop stopped!');
	}

	_loop() {
		const now = performance.now();
		let dtime = now - this._lastTime - (this.numIterations - 1) * this._timePerIteration;
		this._lastTime = now;
		for (let i = 0; i < this.numIterations; i++) {
			this._process(dtime);
			dtime = this._timePerIteration;
		}
		this._popState();
	}

	_process(dtime) {
		this._angle = (this._angle + 360 * dtime / 1000) % 360;
		this._state.LeftFlipper = new FlipperState(this._angle);
	}

	_popState() {
		const state = this._state;
		this._state = {};
		postMessage({ state });
	}
}

const physicsWorker = new PhysicsWorker();
//
// let angle = 0;
// let table = null;
// let loop = false;
//
//
// setInterval(() => {
// 	if (table) {
// 		angle = (angle + 2) % 360;
// 		postMessage({ LeftFlipper: new FlipperState(angle) });
// 	}
//
// }, 100);

onmessage = e => {
	//console.log('[worker] got message:', e);

	// init
	if (e.data.table) {
		const table = e.data.table;
		for (const name of Object.keys(table.flippers)) {
			table.flippers[name] = new Flipper(name, FlipperData.fromSerialized(table.flippers[name].itemName, table.flippers[name].data));
		}
		physicsWorker.start();
	}
};
