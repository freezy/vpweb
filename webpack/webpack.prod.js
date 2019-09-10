const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common');

module.exports = function(options) {
	return webpackMerge(commonConfig(options), {
		mode: 'production',
	});
};
