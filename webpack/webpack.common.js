const { resolve } = require('path');
const childProcess = require('child_process');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Critters = require('critters-webpack-plugin');
const VpxJsFile = require('../node_modules/vpx-js/dist/build.json');

module.exports = opts => {
	return {
		entry: {
			'app': './src/index.js',
		},
		plugins: [

			new webpack.DefinePlugin({
				PRODUCTION: !opts.devMode,
				'global.VPWEB_BUILD_TIMESTAMP': Date.now(),
				'global.VPWEB_VERSION': JSON.stringify(
					require('../package.json').version + '-' + childProcess.execSync('git rev-parse --short HEAD').toString().trim()
				),
				'global.VPXJS_VERSION': JSON.stringify(
					VpxJsFile.version
				),
				'global.VPXJS_BUILD_TIMESTAMP': JSON.stringify(
					VpxJsFile.timestamp
				),
			  }),

			new HtmlWebpackPlugin({
				template: 'src/index.ejs',
				minify: !opts.devMode,
				PRODUCTION: !opts.devMode,
			}),

			new WebpackPwaManifest({
				name: 'Visual Pinball for the Web',
				short_name: 'VPWeb',
				description: 'Visual Pinball running in the browser',
				theme_color: '#f35000',
				background_color: '#333333',
				crossorigin: 'use-credentials',
				icons: [ {
					src: resolve('src/images/vpinball.png'),
					sizes: [ 72, 96, 128, 192, 256, 384, 512],
					ios: true,
				} ],
				ios: true,
			}),

			new MiniCssExtractPlugin({
				// Options similar to the same options in webpackOptions.output
				// both options are optional
				filename: opts.devMode ? '[name].css' : '[name].[hash].css',
				chunkFilename: opts.devMode ? '[id].css' : '[id].[hash].css',
			}),

			new Critters(),

			new CopyPlugin([ { from: 'src/favicon.ico', to: 'favicon.ico' } ]),

			// new webpack.ProvidePlugin({
			// 	__alloc__: resolve('./webpack/alloc-log-collector'),
			// }),
		],
		module: {
			rules: [
				{
					test: /\.vbs$/i,
					use: 'raw-loader',
				},
				{
					test: /\.(sa|sc|c)ss$/,
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
							options: { hmr: !opts.devMode },
						}, {
							loader: 'css-loader',
						}, {
							loader: 'postcss-loader',
							options: { plugins: () => [ require('autoprefixer') ], }
						}, {
							loader: 'sass-loader'
						},
					],
				},
				{
					test: /\.(eot|woff|woff2|ttf|otf|png|jpg|swf|hdr|exr)$/,
					use: { loader: 'file-loader', options: {name: '[path][name]-[sha256:hash:base58:8].[ext]'} },
				}, {
					test: /\.ejs$/,
					use: 'ejs-loader',
				},
				{
					test: /\.svg$/,
					loader: 'svg-inline-loader'
				},
			],
			noParse: /moo\.js/
		},
		output: {
			path: resolve(__dirname, '..', 'dist'),
			filename: '[name].bundle-[chunkhash].js',
			hashFunction: 'sha256',
			hashDigest: 'hex',
			hashDigestLength: 12
		},
		optimization: {
			splitChunks: {
				chunks: 'all',
				cacheGroups: {
					meshes: {
						test: /node_modules[\\/]vpx-js[\\/]dist[\\/]esm[\\/]res[\\/]meshes/,
						name: "vpx-meshes",
						chunks: "initial",
						enforce: true,
						priority: 20,
					},
					vpx: {
						test: /node_modules[\\/]vpx-js/,
						name: "vpx-js",
						chunks: "initial",
						enforce: true,
						priority: 10,
					},
					vendor: {
						test: /node_modules/,
						name: "vendor",
						chunks: "initial",
						enforce: true,
						priority: 0,
					}
				}
			}
		},
		devtool: 'source-map'
	};
};
