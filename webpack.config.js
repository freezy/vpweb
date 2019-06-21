const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = () => {
	return {
		entry: {
			'app': './src/index.js',
		},
		mode: 'development',
		plugins: [
			new HtmlWebpackPlugin({
				template: 'src/index.html',
				minify: true,
			}),
		],
		module: {
			rules: [
			],
		},
		output: {
			path: resolve(__dirname, 'dist'),
			filename: '[name].bundle-[chunkhash].js',
			hashFunction: 'sha256',
			hashDigest: 'hex',
			hashDigestLength: 12,
		},
		devtool: 'source-map',
	};
};
