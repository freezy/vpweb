const webpackMerge = require('webpack-merge');
const prodConfig = require('./webpack.prod');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = function(options) {
	return webpackMerge(prodConfig(options), {
		plugins: [
			new BundleAnalyzerPlugin()
		]
	});
};
