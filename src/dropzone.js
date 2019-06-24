export class DropZone {

	static dropHandler(ev) {
		let i;
		console.log('File(s) dropped', ev);

		if (ev.dataTransfer.items) {
			// Use DataTransferItemList interface to access the file(s)
			for (i = 0; i < ev.dataTransfer.items.length; i++) {
				// If dropped items aren't files, reject them
				if (ev.dataTransfer.items[i].kind === 'file') {
					const file = ev.dataTransfer.items[i].getAsFile();
					console.log('... file[' + i + '].name = ' + file.name);
				}
			}
		} else {
			// Use DataTransfer interface to access the file(s)
			for (i = 0; i < ev.dataTransfer.files.length; i++) {
				console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
			}
		}
		ev.target.classList.remove('bg-warning');
		ev.preventDefault();
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
