import './index.sass';

import {FileCache} from './file-cache';
import {Loader} from './loader';
import * as timeago from 'timeago.js';

const cache = new FileCache();
const loader = new Loader(cache);

const vpWebBuildTime = ' (' + timeago.format(global.VPWEB_BUILD_TIMESTAMP) + ')';
const vpxJsBuildTime = ' (' + timeago.format(global.VPXJS_BUILD_TIMESTAMP) + ')';
const detailText = 'VPX-JS ' + global.VPXJS_GIT_BRANCH + '@' + global.VPXJS_GIT_HASH + vpxJsBuildTime +
	'\nVPWEB v' + global.VPWEB_VERSION + vpWebBuildTime;

document.getElementById('vpx-version-details').textContent = 'VPX-JS v' + global.VPXJS_VERSION;
document.getElementById('vpx-version-details').title = detailText;

window.vpw = { loader };

cache.init()
	.then(() => cache.get())
	.then(cachedVpx => {
		if (cachedVpx) {
			return loader.loadBlob(cachedVpx);
		}
	});
