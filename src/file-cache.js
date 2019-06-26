
export class FileCache {


	constructor() {
		this.isAvailable = 'caches' in self;
		this.key = new Request('/last-vpx-upload');
	}

	async init() {
		if (this.isAvailable) {
			this.cache = await caches.open('vpweb-cache');
		}
	}

	async save(blob) {
		if (!this.isAvailable) {
			return Promise.resolve();
		}
		await this.cache.put(this.key, new Response(blob));
	}

	async get() {
		if (!this.isAvailable) {
			return Promise.resolve();
		}
		const response = await this.cache.match(this.key);
		return response.blob();
	}
}
