import {Table} from '../../vpx-js/dist/lib/vpt/table/table'
import {Player} from '../../vpx-js/dist/lib/game/player'
import {BrowserBinaryReader} from '../../vpx-js/dist/lib/io/binary-reader.browser';

let tableParseStart = 0;
self.vpw = {
	showNumCycles: false,
};
class PlayerWorker {

	constructor() {
	}

	/**
	 * @param {Table} table
	 */
	async start(table) {
		console.log('[PlayerWorker.start] Worker parsed table in %sms', Date.now() - tableParseStart);

		this._table = table;

		this._player = new Player(table);
		this._player.on('ballCreated', ball => postMessage({ event: 'ballCreated', data: ball.data, state: ball.getState() }));
		this._player.on('ballDestroyed', ball => postMessage({event: 'ballDestroyed', name: ball.getName()}));
		this._player.init();
		this._looping = true;

		// set some debugging globals
		self.vpw.tableItems = {};
		for (const item of [ ...table.getMovables(), ...table.getAnimatables() ]) {
			self.vpw.tableItems[item.getName()] = item;
		}
		self.vpw.items = table.getElementApis();

		let numCalls = 0;
		let numCycles = 0;
		let time = performance.now();
		do {
			numCycles += await this._work();
			numCalls++;
			if (performance.now() - time > 1000) {
				if (self.vpw.showNumCycles) {
					console.log('[PlayerWorker] %s cycles/s at %s calls /s', numCycles, numCalls);
				}
				time = performance.now();
				numCycles = 0;
				numCalls = 0;
			}

		} while (this._looping);
	}

	stop() {
		this._looping = false;
		console.log('[PlayerWorker.stop] Physics loop stopped!');
	}

	_work() {
		return new Promise(resolve => setTimeout(() => {
			resolve(this._player.updatePhysics());
		}, 0));
	}

	onEvent(name, data) {
		console.log(name, data);
		switch (name) {
			// case 'leftFlipperKeyDown':
			// 	this._table.flippers.LeftFlipper.api.rotateToEnd();
			// 	break;
			// case 'leftFlipperKeyUp':
			// 	this._table.flippers.LeftFlipper.api.rotateToStart();
			// 	break;
			// case 'rightFlipperKeyDown':
			// 	this._table.flippers.RightFlipper.api.rotateToEnd();
			// 	break;
			// case 'rightFlipperKeyUp':
			// 	this._table.flippers.RightFlipper.api.rotateToStart();
			// 	break;
			// case 'plungerKeyDown':
			// 	this._table.plungers.Plunger.api.PullBack();
			// 	break;
			// case 'plungerKeyUp':
			// 	this._table.plungers.Plunger.api.Fire();
			// 	break;
			case 'keyDown':
				if (this._player) {
					this._player.onKeyDown(data);
				}
				break;
			case 'keyUp':
				if (this._player) {
					this._player.onKeyUp(data);
				}
				break;
			case 'popStates':
				if (this._player) {
					const states = this._player.popStates();
					postMessage({ states: states.changedStates });
					states.release();
				}
				break;
		}
	}
}

const physicsWorker = new PlayerWorker();

onmessage = e => {

	if (!physicsWorker) {
		return;
	}

	// init
	if (e.data.blob) {
		tableParseStart = Date.now();
		Table.load(new BrowserBinaryReader(e.data.blob))
			.then(table => physicsWorker.start(table));
	}

	if (e.data.event) {
		physicsWorker.onEvent(e.data.event, e.data.data);
	}
};
