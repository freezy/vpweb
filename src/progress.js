export class ProgressModal {

	constructor() {
		this.modal = document.getElementById('progress-modal');
		this.overlay = document.getElementById('modal-overlay');

		this.titleEl = document.getElementById('progress-header');
		this.actionEl1 = document.getElementById('progress-action1');
		this.detailEl1 = document.getElementById('progress-item1');
		this.actionEl2 = document.getElementById('progress-action2');
		this.detailEl2 = document.getElementById('progress-item2');

		this.spans = {};
		this.workerSpans = {};
		this.titles = [];
		this.workerTitles = [];
		this.isOpen = false;
	}

	open() {
		this.modal.classList.remove('closed');
		this.overlay.classList.remove('closed');
		this.isOpen = true;
	}

	close() {
		this.modal.classList.add('closed');
		this.overlay.classList.add('closed');
		this.isOpen = false;
	}

	start(id, title, fromWorker) {
		const spans = fromWorker ? this.workerSpans : this.spans;
		const titles = fromWorker ? this.workerTitles : this.titles;
		spans[id] = title;
		titles.push(title);
		this.titleEl.innerText = title;
		if (!this.isOpen) {
			this.open();
		}
		if (this.endTimeout) {
			clearTimeout(this.endTimeout);
			this.endTimeout = 0;
		}
	}

	end(id, fromWorker) {
		const spans = fromWorker ? this.workerSpans : this.spans;
		const titles = fromWorker ? this.workerTitles : this.titles;
		delete spans[id];
		titles.pop();
		if (Object.keys(spans).length === 0) {
			this.show('Done!', undefined, fromWorker);
		}
		if (Object.keys(this.spans).length === 0 && Object.keys(this.workerSpans).length === 0) {
			this.endTimeout = setTimeout(() => {
				this.close();
				this.endTimeout = 0;
			}, 1000);
		} else {
			const nextTitles = this.titles.length ? this.titles : this.workerTitles;
			if (nextTitles.length) {
				this.titleEl.innerText = nextTitles[nextTitles.length - 1];
			}
		}
	}

	show(action, details, fromWorker) {
		const el = fromWorker ? this.actionEl2 : this.actionEl1;
		el.innerText = action;
		this.details(details, fromWorker)
	}

	details(details, fromWorker) {
		const el = fromWorker ? this.detailEl2 : this.detailEl1;
		if (details) {
			el.innerText = details;
		} else {
			el.innerText = '';
		}
	}
}
