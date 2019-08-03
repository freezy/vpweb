import {Table} from '../../vpx-toolbox/dist/lib/vpt/table/table';
import {BrowserBinaryReader} from '../../vpx-toolbox/dist/lib/io/binary-reader.browser';

import {Renderer} from './renderer';
import {Physics} from './physics';

export class Loader {

	constructor(cache) {
		this.cache = cache;
		this.dropzone = document.getElementById('dropzone');
	}

	async loadVpx(file) {
		const table = await Table.load(new BrowserBinaryReader(file));
		return table;
	}

	async createScene(table) {
		const now = Date.now();
		const scene = await table.exportScene({
			applyMaterials: true,
			applyTextures: false,
			optimizeTextures: false,
			exportPlayfieldLights: true,
			exportLightBulbLights: false,

			exportPlayfield: true,
			exportPrimitives: true,
			exportRubbers: true,
			exportSurfaces: true,
			exportFlippers: true,
			exportBumpers: true,
			exportRamps: true,
			exportLightBulbs: true,
			exportHitTargets: true,
			exportGates: true,
			exportKickers: true,
			exportTriggers: true,
			exportSpinners: true,
			exportPlungers: true,
			gltfOptions: {compressVertices: false, forcePowerOfTwoTextures: false},
		});
		console.log('Scene created in %sms.', Date.now() - now, table, scene);
		return scene;
	}

	onVpxLoaded(table) {
		if (!table) {
			return;
		}
		return this.createScene(table).then(scene => {
			if (!this.renderer) {
				this.renderer = new Renderer(scene);
				this.renderer.init();
				this.renderer.animate();
			}
			this.renderer.setPlayfield(scene.children[0]);
			this.renderer.setPhysics(new Physics(table, this.renderer.scene));

			return this.renderer;
		});
	}

	dropHandler(ev) {
		console.log('File(s) dropped', ev);

		if (ev.dataTransfer.items) {
			// Use DataTransferItemList interface to access the file(s)
			for (const item of ev.dataTransfer.items) {
				// If dropped items aren't files, reject them
				if (item.kind === 'file') {
					const file = item.getAsFile();
					this.cache.save(file);
					this.loadVpx(file).then(this.onVpxLoaded.bind(this));
				}
			}
		} else {
			// Use DataTransfer interface to access the file(s)
			for (const file of ev.dataTransfer.files) {
				this.loadVpx(file).then(this.onVpxLoaded.bind(this));
			}
		}
		this.dropzone.classList.remove('bg-dropzone-hover');
		ev.preventDefault();
	}

	dragEnterHandler(ev) {
		this.dropzone.classList.add('bg-dropzone-hover');
		ev.preventDefault();
	}

	dragLeaveHandler(ev) {
		this.dropzone.classList.remove('bg-dropzone-hover');
		ev.preventDefault();
	}

	dragOverHandler(ev) {
		ev.preventDefault();
	}

}
