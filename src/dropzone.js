//import {Table} from '../../vpx-toolbox/dist/lib/vpt/table';

export class DropZone {

	static dropHandler(ev) {
		console.log('File(s) dropped', ev);

		if (ev.dataTransfer.items) {
			// Use DataTransferItemList interface to access the file(s)
			for (const item of ev.dataTransfer.items) {
				// If dropped items aren't files, reject them
				if (item.kind === 'file') {
					const file = item.getAsFile();
					console.log('item name = ' + file.name);
				}
			}
		} else {
			// Use DataTransfer interface to access the file(s)
			for (const file of ev.dataTransfer.files) {
				console.log('file name = ' + file.name);
			}
		}
		ev.target.classList.remove('bg-warning');
		ev.preventDefault();
	}

	static loadVpx(file) {
		// Table.loadBlob(file).then(table => {
		// 	console.log('Table loaded: ', table);
		// })
	}

	static dragEnterHandler(ev) {
		ev.target.classList.add('bg-warning');
		ev.preventDefault();
	}

	static dragLeaveHandler(ev) {
		ev.target.classList.remove('bg-warning');
		ev.preventDefault();
	}

	static dragOverHandler(ev) {
		ev.preventDefault();
	}

}
