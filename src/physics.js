import {FlipperState} from '../../vpx-toolbox/dist/lib/vpt/flipper/flipper-state'
import {Player} from '../../vpx-toolbox/dist/lib/game/player'
import {Table} from '../../vpx-toolbox/dist/lib/vpt/table'

export class Physics {

	/**
	 * @param {Table} table
	 * @param {Scene} scene
	 */
	constructor(table, scene) {
		this.table = table;
		this.scene = scene;
		this._player = new Player(table);

		this.sceneItems = {};
		this.tableItems = {};

		const playfield = this.scene.children.find(c => c.name === 'playfield');

		// index scene items
		if (playfield) {
			for (const itemGroup of playfield.children) {
				for (const item of itemGroup.children) {
					this.sceneItems[item.name] = item;
					item.matrixAutoUpdate = false;
				}
			}
		}

		// index table items
		for (const movable of table.getMovables()) {
			this.tableItems[movable.getName()] = movable;
		}
	}

	update() {
		this._player.updatePhysics();
		this._updateState(this._player.popState())
	}

	leftFlipperKeyDown() {
		this.keyDownTime = performance.now();
		this.table.flippers.LeftFlipper.rotateToEnd();
		return true;
	}

	leftFlipperKeyUp() {
		this.table.flippers.LeftFlipper.rotateToStart();
		return true;
	}

	rightFlipperKeyDown() {
		this.keyDownTime = performance.now();
		this.table.flippers.RightFlipper.rotateToEnd();
		return true;
	}

	rightFlipperKeyUp() {
		this.table.flippers.RightFlipper.rotateToStart();
		return true;
	}

	plungerKeyDown() {
		this.table.plungers[0].pullBack();
		return true;
	}

	plungerKeyUp() {
		this.table.plungers[0].fire();
		return true;
	}

	_updateState(state) {
		if (!state) {
			return;
		}
		for (const name of Object.keys(state)) {
			if (!this.sceneItems[name]) {
				console.warn('No scene item called %s found!', name, state[name]);
				break;
			}
			if (!this.tableItems[name]) {
				console.warn('No table item called %s found!', name, state[name]);
				break;
			}

			if (this.keyDownTime) {
				const lat = performance.now() - this.keyDownTime;
				console.debug('[Latency] = %sms', Math.round(lat * 1000) / 1000);
				this.keyDownTime = undefined;
			}
			const tableItem = this.tableItems[name];
			const sceneItem = this.sceneItems[name];
			tableItem.updateState(state[name], sceneItem);
		}
	}
}
