import './index.sass';

import {FileCache} from './file-cache';
import {Loader} from './loader';
import * as timeago from 'timeago.js';

const cache = new FileCache();
const loader = new Loader(cache);

const vpWebBuildTime = timeago.format(global.VPWEB_BUILD_TIMESTAMP);
console.log('VPWEB BUILD was', vpWebBuildTime);


window.vpw = { loader };
window.build = {
	vpWebBuildTime,
	vpWebVersion: global.VPWEB_VERSION,
	vpxJsVersion: global.VPXJS_VERSION,
}

cache.init()
	.then(() => cache.get())
	.then(cachedVpx => {
		if (cachedVpx) {
			return loader.loadBlob(cachedVpx);
		}
	});
