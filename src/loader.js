import {Table} from '../../vpx-js/dist/lib/vpt/table/table';
import {ThreeRenderApi} from '../../vpx-js/dist/lib/render/threejs/three-render-api'
import {BrowserBinaryReader} from '../../vpx-js/dist/lib/io/binary-reader.browser';
import {ThreeTextureLoaderBrowser} from '../../vpx-js/dist/lib/render/threejs/three-texture-loader-browser';

import {Renderer} from './renderer';
import {Physics} from './physics';
import {Controller} from "./controller";
import {Scene} from "three";

export class Loader {

	constructor(cache) {
		this.cache = cache;
		this.dropzone = document.getElementById('dropzone');
		this.renderApi = new ThreeRenderApi({
			applyMaterials: true,
			applyTextures: new ThreeTextureLoaderBrowser(),
			optimizeTextures: false,
		});
	}

	async loadVpx(file) {
		return await Table.load(new BrowserBinaryReader(file));
	}

	async createScene(table) {
		const now = Date.now();
		const tableObj = await table.generateTableNode(this.renderApi, {

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
		const scene = new Scene();
		scene.name = 'table';
		scene.add(tableObj);
		console.log('Scene created in %sms.', Date.now() - now, table, tableObj);
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

			const playfield = scene.children[0];
			this.renderer.setPlayfield(playfield);
			this.renderer.setPhysics(new Physics(table, this.renderer.scene, this.renderApi));

			window.vpw.table = table;
			window.vpw.physics = this.renderer.physics;

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
					this.loadVpx(file)
						.then(this.onVpxLoaded.bind(this))
						.then(renderer => {
							if (renderer) {
								window.vpw.controller = new Controller(renderer);
							}
						});
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
