import {Table} from '../../vpx-js/dist/lib/vpt/table/table';
import {ThreeRenderApi} from '../../vpx-js/dist/lib/render/threejs/three-render-api'
import {BrowserBinaryReader} from '../../vpx-js/dist/lib/io/binary-reader.browser';
import {ThreeTextureLoaderBrowser} from '../../vpx-js/dist/lib/render/threejs/three-texture-loader-browser';
import {Progress, progress} from '../../vpx-js/dist/lib/util/logger';

import {Renderer} from './renderer';
import {PlayerController} from './player.controller';
import {Controller} from "./controller";
import {ProgressModal} from "./progress";

export class Loader {

	/**
	 * @param {FileCache} cache
	 */
	constructor(cache) {
		this.cache = cache;
		this.dropzone = document.getElementById('dropzone');
		this.renderApi = new ThreeRenderApi({
			applyMaterials: true,
			applyTextures: new ThreeTextureLoaderBrowser(),
			optimizeTextures: false,
		});

		// link progress modal
		this.progressModal = new ProgressModal();
		Progress.setProgress(this.progressModal);
	}

	/**
	 * Loads everything given an uploaded Blob.
	 *
	 * @param blob
	 * @return {Promise<void>}
	 */
	async loadBlob(blob) {

		// spawn worker
		this.player = new PlayerController(blob, this.renderApi, this.progressModal);

		// parse table
		const table = await this._parseBlob(blob);

		// setup scene
		progress().start('table.playfield', 'Generating playfield');
		const playfield = await this._generatePlayfield(table);
		this._setupRenderer(playfield);

		// start player
		this.player.init(table, this.renderer);
		this.renderer.setPlayer(this.player);
		progress().end('table.playfield');

		window.vpw.controller = new Controller(this.renderer);
		window.vpw.table = table;
		window.vpw.physics = this.renderer.player;
	}

	reset() {
		this.player.reset();
		this.renderer.reset();
		this.cache.reset().then(() => {
			delete this.player;
			delete this.renderer;

			delete window.vpw.controller;
			delete window.vpw.table;
			delete window.vpw.physics;
		});
	}

	/**
	 * Creates a parsed table object from an uploaded .vpx.
	 *
	 * @param {Blob} blob
	 * @return {Promise<Table>}
	 */
	async _parseBlob(blob) {
		// load table
		return await Table.load(new BrowserBinaryReader(blob));
	}

	async _generatePlayfield(table) {
		if (!table) {
			return;
		}
		const now = Date.now();
		const tableObj = await table.generateTableNode(this.renderApi, {

			exportPlayfieldLights: true,
			exportLightBulbLights: true,

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
		console.log('Scene created in %sms.', Date.now() - now, table, tableObj);
		return tableObj;
	}

	_setupRenderer(playfield) {
		if (!playfield) {
			return;
		}
		if (!this.renderer) {
			this.renderer = new Renderer();
			this.renderer.init();
			this.renderer.animate();
		}
		this.renderer.setPlayfield(playfield);
	}

	dropHandler(ev) {
		console.log('File(s) dropped', ev);

		if (ev.dataTransfer.items) {
			// Use DataTransferItemList interface to access the file(s)
			for (const item of ev.dataTransfer.items) {
				// If dropped items aren't files, reject them
				if (item.kind === 'file') {
					const file = item.getAsFile();
					this.cache.save(file).then(() => this.loadBlob(file));

					// we only need one file
					break;
				}
			}
		} else {
			// Use DataTransfer interface to access the file(s)
			for (const file of ev.dataTransfer.files) {
				this.cache.save(file).then(() => this.loadBlob(file));
				break;
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
