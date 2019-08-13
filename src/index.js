import './index.sass';
import { Controller } from './controller';
import { FileCache } from './file-cache';
import { Loader } from './loader';

window.vpw = {};

const cache = new FileCache();
const loader = new Loader(cache);
cache.init()
	.then(() => cache.get())
	.then(cachedVpx => {
		if (cachedVpx) {
			return loader.loadVpx(cachedVpx);
		}
	})
	.then(loader.onVpxLoaded.bind(loader))
	.then(renderer => {
		if (renderer) {
			window.vpw.controller = new Controller(renderer);
		}
	});

window.vpw.loader = loader;


