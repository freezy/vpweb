
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

	/**
	 * Saves the table to the cache.
	 * @param {Blob} blob
	 * @return {Promise<void>}
	 */
	async save(blob) {
		if (!this.isAvailable) {
			return Promise.resolve();
		}
		await this.cache.put(this.key, new Response(blob));
	}

	/**
	 * Returns the table from the cache
	 * @return {Promise<Blob|undefined>}
	 */
	async get() {
		if (!this.isAvailable) {
			return Promise.resolve(undefined);
		}
		const response = await this.cache.match(this.key);
		if (!response) {
			return Promise.resolve(undefined);
		}
		return response.blob();
	}
}
