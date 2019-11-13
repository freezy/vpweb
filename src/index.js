import './index.sass';

import {FileCache} from './file-cache';
import {Loader} from './loader';

const cache = new FileCache();
const loader = new Loader(cache);

window.vpw = { loader };

cache.init()
	.then(() => cache.get())
	.then(cachedVpx => {
		if (cachedVpx) {
			return loader.loadBlob(cachedVpx);
		}
	});
