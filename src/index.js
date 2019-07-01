import './index.sass';
import { Loader } from './loader';
import { FileCache } from './file-cache';

const cache = new FileCache();
const loader = new Loader(cache);
cache.init()
	.then(() => cache.get())
	.then(cachedVpx => {
		if (cachedVpx) {
			return loader.loadVpx(cachedVpx);
		}
	})
	.then(loader.onVpxLoaded.bind(loader));

window.loader = loader;



