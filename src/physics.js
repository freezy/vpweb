import {Math as _M, Matrix4} from 'three';
import Worker from 'worker-loader!./physics.worker.js';

export class Physics {

	constructor(table, scene) {
		this.table = table;
		this.scene = scene;
		this.worker = new Worker();
		this.worker.postMessage({ table });
		this.worker.onmessage = this._onMessage.bind(this);
		this.angle = 0;
	}

	_onMessage(e) {

		console.log('got message:', e.data);
		if (e.data.LeftFlipper) {
			const matrix = new Matrix4();
			matrix.set.apply(matrix, e.data.LeftFlipper);
			const LeftFlipper = this.scene.children[3].children[4].children[0];
			const RightFlipper = this.scene.children[3].children[4].children[1];
			LeftFlipper.matrixAutoUpdate = false;

			// this.angle += 0.01;
			// const m = new Matrix4().makeRotationZ(Math.PI * this.angle);
			// LeftFlipper.applyMatrix(m);
			LeftFlipper.applyMatrix(matrix);


			//this.scene.children[3].children[4].children[0].matrixAutoUpdate = false;
			// this.scene.children[3].children[4].children[0].children[0].matrixAutoUpdate = false;
			// this.scene.children[3].children[4].children[0].children[1].matrixAutoUpdate = false;
			// this.scene.children[3].children[4].children[0].children[0].applyMatrix(matrix);
			// this.scene.children[3].children[4].children[0].children[1].applyMatrix(matrix);
			//this.scene.children[3].children[4].children[0].children[1].applyMatrix(matrix);
		}
		//.rotation.set(0, 0, _M.degToRad(e.data.angle));
	}

}
