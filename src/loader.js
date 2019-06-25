import {Table} from '../../vpx-toolbox/dist/lib/vpt/table';
import {BrowserBinaryReader} from '../../vpx-toolbox/dist/lib/io/binary-reader.browser';

export class Loader {

	constructor(cache) {
		this.cache = cache;
	}

	async loadVpx(file) {
		const table = await Table.load(new BrowserBinaryReader(file));
		console.log('Table loaded: ', table);
		const scene = await table.exportScene({
			applyMaterials: false,
			applyTextures: false,
			optimizeTextures: false,
			exportPlayfield: true,
			exportPrimitives: true,
			exportRubbers: true,
			exportSurfaces: true,
			exportFlippers: true,
			exportBumpers: true,
			exportRamps: true,
			exportPlayfieldLights: true,
			exportLightBulbs: true,
			exportLightBulbLights: true,
			exportHitTargets: true,
			exportGates: true,
			exportKickers: true,
			exportTriggers: true,
			exportSpinners: true,
			gltfOptions: { compressVertices: false, forcePowerOfTwoTextures: false },
		});
		console.log('Scene created:', scene);
	}

	dropHandler(ev) {
		console.log('File(s) dropped', ev);

		if (ev.dataTransfer.items) {
			// Use DataTransferItemList interface to access the file(s)
			for (const item of ev.dataTransfer.items) {
				// If dropped items aren't files, reject them
				if (item.kind === 'file') {
					const file = item.getAsFile();
					console.log('item name = ' + file.name);
					this.cache.save(file);
					this.loadVpx(file);
				}
			}
		} else {
			// Use DataTransfer interface to access the file(s)
			for (const file of ev.dataTransfer.files) {
				console.log('file name = ' + file.name);
				this.loadVpx(file);
			}
		}
		ev.target.classList.remove('bg-warning');
		ev.preventDefault();
	}

	dragEnterHandler(ev) {
		ev.target.classList.add('bg-warning');
		ev.preventDefault();
	}

	dragLeaveHandler(ev) {
		ev.target.classList.remove('bg-warning');
		ev.preventDefault();
	}

	dragOverHandler(ev) {
		ev.preventDefault();
	}

}
