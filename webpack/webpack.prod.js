const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = function() {
	return webpackMerge(commonConfig({ devMode: false }), {
		mode: 'production',
		plugins: [
			new WorkboxPlugin.GenerateSW({
				swDest: 'sw.js',
				clientsClaim: true,
				skipWaiting: true,
			}),
		]
	});
};
