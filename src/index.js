import './index.sass';

// class A {
// 	constructor() {
// 		console.log('A created!');
// 	}
// }
//
// const a = new A();

import { Controller } from './controller';
import { FileCache } from './file-cache';
import { Loader } from './loader';

const cache = new FileCache();
const loader = new Loader(cache);

window.vpw = { loader };

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
