import {Player} from '../../vpx-js/dist/lib/game/player'
import {Table} from '../../vpx-js/dist/lib/vpt/table/table'
import {Vertex3D} from '../../vpx-js/dist/lib/math/vertex3d'

export class Physics {

	/**
	 * @param {Table} table
	 * @param {Scene} scene
	 */
	constructor(table, scene, renderApi) {
		/** @type Table */
		this.table = table;
		this.scene = scene;
		this.renderApi = renderApi;
		this._player = new Player(table);
		this._player.on('ballCreated', ball => {
			const name = ball.getName();
			console.log('Created ball:', name);
			ball.addToScene(this.scene, this.renderApi, this.table).then(mesh => {
				this.sceneItems[name] = mesh;
				this.tableItems[name] = ball;
			});
			this.ballName = ball.getName();
		});
		this._player.on('ballDestroyed', ball => {
			console.log('Destroyed ball:', ball);
			delete this.sceneItems[ball.getName()];
			delete this.tableItems[ball.getName()];
			ball.removeFromScene(this.scene, this.renderApi);
			this.ballName = undefined;
		});
		this._player.init();

		this.sceneItems = {};
		this.tableItems = {};

		const playfield = this.scene.children.find(c => c.name === 'playfield');

		// index scene items
		if (playfield) {
			for (const itemGroup of playfield.children) {
				for (const item of itemGroup.children) {
					this.sceneItems[item.name] = item;
					item.matrixAutoUpdate = false;
					for (const meshItem of item.children) {
						meshItem.matrixAutoUpdate = false;
					}
				}
			}
		}

		// index table items
		for (const movable of table.getMovables()) {
			this.tableItems[movable.getName()] = movable;
		}
		for (const movable of table.getAnimatables()) {
			this.tableItems[movable.getName()] = movable;
		}

		// index public apis
		window.vpw.items = table.getElementApis();
		window.vpw.player = this._player;
		window.vpw.sceneItems = this.sceneItems;
		window.vpw.tableItems = this.tableItems;

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

		// debug functions
		window.vpw.createBall = function(x, y, z, vx, vy, vz) {
			return this._player.createBall({
				getBallCreationPosition(t) {
					return new Vertex3D(x, y, z || 0);
				},
				getBallCreationVelocity(t) {
					return new Vertex3D(vx || 0, vy || 0, vz || 0);
				},
				onBallCreated(p, b) {
				},
			});
		}.bind(this);
	}

	update() {
		this._player.updatePhysics();
		const states = this._player.popStates();
		this._updateState(states);
		states.release();
	}

	leftFlipperKeyDown() {
		this.keyDownTime = performance.now();
		this.table.flippers.LeftFlipper.getApi().rotateToEnd();
		return true;
	}

	leftFlipperKeyUp() {
		this.table.flippers.LeftFlipper.getApi().rotateToStart();
		return true;
	}

	rightFlipperKeyDown() {
		this.keyDownTime = performance.now();
		this.table.flippers.RightFlipper.getApi().rotateToEnd();
		return true;
	}

	rightFlipperKeyUp() {
		this.table.flippers.RightFlipper.getApi().rotateToStart();
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
		const ball = this._player.createBall(this.table.kickers.BallRelease);
	}

	/**
	 * Updates the scene according to the changed states.
	 * @param {ChangedStates} states
	 * @private
	 */
	_updateState(states) {

		if (this.ballName && !states.keys.includes(this.ballName)) {
			console.warn('Ball did not move!');
		}
		for (const name of states.keys) {
			const state = states.getState(name).newState;
			if (!this.sceneItems[state.getName()]) {
				//console.warn('No scene item called %s found!', state.getName(), states);
				break;
			}
			if (!this.tableItems[state.getName()]) {
				console.warn('No table item called %s found!', state.getName(), states);
				break;
			}

			if (this.keyDownTime) {
				const lat = performance.now() - this.keyDownTime;
				//console.debug('[Latency] = %sms', Math.round(lat * 1000) / 1000);
				this.keyDownTime = undefined;
			}
			const tableItem = this.tableItems[state.getName()];
			const sceneItem = this.sceneItems[state.getName()];
			tableItem.applyState(sceneItem, this.renderApi, this.table, this._player, states.getState(name).oldState);
		}
	}
}
