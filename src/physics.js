import {Player} from '../../vpx-js/dist/lib/game/player'
import {Table} from '../../vpx-js/dist/lib/vpt/table/table'

export class Physics {

	/**
	 * @param {Table} table
	 * @param {Scene} scene
	 */
	constructor(table, scene) {
		/** @type Table */
		this.table = table;
		this.scene = scene;
		this._player = new Player(table);
		this._player.on('ballCreated', name => {
			console.log('Created ball:', name);
			const ball = this._player.balls.find(b => b.getName() === name);
			this.table.exportElement(ball).then(mesh => {
				const playfield = this.scene.children.find(c => c.name === 'playfield');
				const ballGroup = playfield.children.find(c => c.name === 'balls');
				mesh.matrixAutoUpdate = false;
				ballGroup.add(mesh);
				this.sceneItems[name] = mesh;
				this.tableItems[name] = ball;
			});
		});
		this._player.on('ballDestroyed', ball => {
			console.log('Destroyed ball:', ball);
		});

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

		// draw hit rectangles
		// for (const hittable of table.getHittables().filter(h => h.constructor.name === 'Flipper')) {
		// 	for (const hitObject of hittable.getHitShapes()) {
		// 		hitObject.calcHitBBox();
		// 		const rect = hitObject.hitBBox;
		//
		// 		const boxGeometry = new BoxGeometry(rect.width, rect.height, rect.depth);
		// 		const mat = new MeshBasicMaterial({
		// 			color: 0xff0000,
		// 			wireframe: true
		// 		});
		// 		const box = new Mesh(boxGeometry, mat);
		// 		//const wireframe = new WireframeHelper( box, 0x00ff00 );
		// 		box.position.set(rect.right, rect.top, -rect.zhigh);
		//
		// 		playfield.add(box);
		// 		//playfield.add(wireframe);
		// 	}
		// }
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
		this.table.plungers.Plunger.pullBack();
		return true;
	}

	plungerKeyUp() {
		this.table.plungers.Plunger.fire();
		return true;
	}

	createBall() {
		this._player.createBall(this.table.kickers.BallRelease);
	}

	_updateState(states) {
		for (const state of states) {
			if (!this.sceneItems[state.getName()]) {
				console.warn('No scene item called %s found!', state.getName(), states);
				break;
			}
			if (!this.tableItems[state.getName()]) {
				console.warn('No table item called %s found!', state.getName(), states);
				break;
			}

			if (this.keyDownTime) {
				const lat = performance.now() - this.keyDownTime;
				console.debug('[Latency] = %sms', Math.round(lat * 1000) / 1000);
				this.keyDownTime = undefined;
			}
			const tableItem = this.tableItems[state.getName()];
			const sceneItem = this.sceneItems[state.getName()];
			tableItem.applyState(sceneItem, this.table, this._player);
		}
	}
}
