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
			})
		],
		module: {
			rules: [
				{
					test: /\.(scss|sass)$/,
					use: [{
						loader: 'style-loader', // inject CSS to page
					}, {
						loader: 'css-loader', // translates CSS into CommonJS modules
					}, {
						loader: 'postcss-loader', // Run postcss actions
						options: {
							plugins: function () { // postcss plugins, can be exported to postcss.config.js
								return [
									require('autoprefixer')
								];
							}
						}
					}, {
						loader: 'sass-loader' // compiles Sass to CSS
					}]
				},
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
		node: {
			fs: 'empty',
			child_process: 'empty',
		},
	};
};
