import './index.sass';

import {FileCache} from './file-cache';
import {Loader} from './loader';
import * as timeago from 'timeago.js';

const cache = new FileCache();
const loader = new Loader(cache);

const vpWebBuildTime = timeago.format(global.VPWEB_BUILD_TIMESTAMP);
document.getElementById('vpx-version-details').title = 'VPWEB v' + global.VPWEB_VERSION + ', built ' + vpWebBuildTime + '\nVPX-JS v' + global.VPXJS_VERSION;

window.vpw = { loader };

cache.init()
	.then(() => cache.get())
	.then(cachedVpx => {
		if (cachedVpx) {
			return loader.loadBlob(cachedVpx);
		}
	});
