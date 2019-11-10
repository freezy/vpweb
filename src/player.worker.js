import {Table} from '../../vpx-js/dist/lib/vpt/table/table'
import {Player} from '../../vpx-js/dist/lib/game/player'
import {BrowserBinaryReader} from '../../vpx-js/dist/lib/io/binary-reader.browser';

let tableParseStart = 0;
self.vpw = {
	showNumCycles: false,
};
class PlayerWorker {

	constructor() {
		this.totalCycles = 0;
		this.numCycles = 0;
		setInterval(() => {
			postMessage({ cpf: this.numCycles - this.totalCycles });
			this.totalCycles = this.numCycles;
			this.numCycles = 0;
		}, 1000);
	}

	/**
	 * @param {Table} table
	 */
	async start(table) {
		console.log('[PlayerWorker.start] Worker parsed table in %sms', Date.now() - tableParseStart);

		self.vpw.table = table;
		self.vpw.scope = {};

		this._player = new Player(table);
		this._player.on('ballCreated', ball => postMessage({ event: 'ballCreated', data: ball.data, state: ball.getState() }));
		this._player.on('ballDestroyed', ball => postMessage({event: 'ballDestroyed', name: ball.getName()}));
		this._player.on('emuStarted', () => postMessage({event: 'emuStarted'}));
		this._player.init(self.vpw.scope);
		this._looping = true;

		// set some debugging globals
		self.vpw.tableItems = {};
		for (const item of table.getScriptables()) {
			self.vpw.tableItems[item.getName()] = item;
		}
		self.vpw.items = table.getElementApis();

		let numCalls = 0;
		let time = performance.now();
		do {
			this.numCycles += await this._work();
			numCalls++;
			if (performance.now() - time > 1000) {
				if (self.vpw.showNumCycles) {
					console.log('[PlayerWorker] %s cycles/s at %s calls /s', this.numCycles, numCalls);
				}
				time = performance.now();
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
		// console.log(name, data);
		switch (name) {
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
			case 'setCabinetInput':
				if (this._player) {
					this._player.setCabinetInput(data.keyNr);
				}
				break;
			case 'setSwitchInput':
				if (this._player) {
					this._player.setSwitchInput(data.switchNr, data.optionalEnableSwitch);
				}
				break;
			case 'onFrame':
				if (this._player) {
					const states = this._player.onFrame();
					postMessage({ states: states.changedStates });
					if (this._player.hasDmd()) {
						postMessage({ dmd: this._player.getDmdFrame(), dim: this._player.getDmdDimensions() })
					}
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
