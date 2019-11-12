const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common');

module.exports = function() {
	return webpackMerge(commonConfig({ devMode: false }), {
		mode: 'production',
	});
};
