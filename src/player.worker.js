import {Table, Player, BrowserBinaryReader, Progress, progress } from 'vpx-js'

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

		Progress.setProgress({
			start(id, title) {
				postMessage({ event: 'progressStart', id, title });
			},
			end(id) {
				postMessage({ event: 'progressEnd', id });
			},
			show(action, details) {
				postMessage({ event: 'progressShow', action, details });
			},
			details(details) {
				postMessage({ event: 'progressDetails', details });
			}
		});
		progress().start('worker', 'Booting up');
	}

	/**
	 * @param {Table} table
	 */
	async start(table) {
		console.log('[PlayerWorker.start] Worker parsed table in %sms', Date.now() - tableParseStart);

		self.vpw.table = table;
		self.vpw.scope = {};

		progress().start('table.player', 'Starting game');
		this._player = new Player(table);
		this._player.on('ballCreated', ball => postMessage({ event: 'ballCreated', id: ball.id, data: ball.data, state: ball.getState() }));
		this._player.on('ballDestroyed', ball => postMessage({event: 'ballDestroyed', name: ball.getName()}));
		this._player.on('emuStarted', () => postMessage({event: 'emuStarted'}));
		this._player.on('paused', () => postMessage({event: 'paused'}));
		this._player.on('resumed', () => postMessage({event: 'resumed'}));
		this._player.init(self.vpw.scope);
		this._looping = true;

		// set some debugging globals
		self.vpw.player = this._player;
		self.vpw.tableItems = {};
		for (const item of table.getScriptables()) {
			self.vpw.tableItems[item.getName()] = item;
		}
		self.vpw.items = table.getElementApis();

		let numCalls = 0;
		let time = performance.now();
		progress().end('table.player');
		progress().end('worker');
		postMessage({event: 'started'});
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
			case 'pause':
				this._player.pause();
				break;
			case 'resume':
				this._player.resume();
				break;
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
