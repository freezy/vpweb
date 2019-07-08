import './index.sass';
import { Controller } from './controller';
import { FileCache } from './file-cache';
import { Loader } from './loader';

const cache = new FileCache();
const loader = new Loader(cache);
const controller = new Controller(loader);
cache.init()
	.then(() => cache.get())
	.then(cachedVpx => {
		if (cachedVpx) {
			return loader.loadVpx(cachedVpx);
		}
	})
	.then(loader.onVpxLoaded.bind(loader));

window.loader = loader;
window.controller = controller;


