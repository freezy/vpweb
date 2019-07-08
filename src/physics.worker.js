import {Table} from '../../vpx-toolbox/dist/lib/vpt/table'
import {Player} from '../../vpx-toolbox/dist/lib/game/player'

class PhysicsWorker {

	constructor() {
		this.fps = 50;
		this.numIterations = 20; // 4 iterations => 240 iterations / s

		this._timePerFrame = 1000 / this.fps; // 16.6ms per frame
		this._timePerIteration = this._timePerFrame / this.numIterations;
		this._angle = 0;
		this._interval = null;
		this._state = {};
	}

	/**
	 * @param {Table} table
	 */
	start(table) {
		if (this._interval) {
			throw new Error('Physics loop already started!');
		}
		this._table = table;
		this._player = new Player(table);
		this._player.setOnStateChanged((name, state) => this._state[name] = state);
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

	onEvent(name) {
		switch (name) {
			case 'leftFlipperKeyDown':
				this._table.flippers.LeftFlipper.rotateToEnd();
				break;
			case 'leftFlipperKeyUp':
				this._table.flippers.LeftFlipper.rotateToStart();
				break;
			case 'rightFlipperKeyDown':
				this._table.flippers.RightFlipper.rotateToEnd();
				break;
			case 'rightFlipperKeyUp':
				this._table.flippers.RightFlipper.rotateToStart();
				break;
		}
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
		this._player.updatePhysics();
		this._player.physicsSimulateCycle(dtime);
		// this._angle = (this._angle + 360 * dtime / 1000) % 360;
		// this._state.LeftFlipper = new FlipperState(this._angle);
	}

	_popState() {
		const state = this._state;
		this._state = {};
		postMessage({ state });
	}
}

const physicsWorker = new PhysicsWorker();

onmessage = e => {
	// init
	if (e.data.table) {
		const table = Table.fromSerialized(e.data.table);
		physicsWorker.start(table);
	}

	if (e.data.event && physicsWorker) {
		physicsWorker.onEvent(e.data.event);
	}
};
