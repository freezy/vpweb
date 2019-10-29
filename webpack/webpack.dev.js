const { resolve } = require('path');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common');

module.exports = function(options) {
	return webpackMerge(commonConfig(options), {
		mode: 'development',
		module: {
			rules: [
				//{ test: /\.js$/, use: [{ loader: resolve('./webpack/alloc-log-loader'), }]},
			],
		},
	});
};
