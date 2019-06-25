
export class FileCache {


	constructor() {
		this.isAvailable = 'caches' in self;
		this.key = new Request('vpx');
	}

	async init() {
		if (this.isAvailable) {
			this.cache = await caches.open('vpx-file');
		}
	}

	async save(blob) {
		if (!this.isAvailable) {
			return Promise.resolve();
		}
		this.cache.put(this.key, new Response(blob));
	}

	async get() {
		if (!this.isAvailable) {
			return Promise.resolve();
		}
		const response = await this.cache.match(this.key);
		return null;
	}
}
