import resolve from "rollup-plugin-node-resolve";
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import commonJS from 'rollup-plugin-commonjs'
import sass from 'node-sass';
import autoprefixer from 'autoprefixer';
import postcss from 'rollup-plugin-postcss';
import OMT from "rollup-plugin-off-main-thread";
import { string } from 'rollup-plugin-string';

export default {
	input: "src/index.js",
	output: {
		dir: "dist",
		format: "amd"
	},
	plugins: [
		resolve({
			browser: true,
		}),
		commonJS(),
		OMT(),
		postcss({
			preprocessor: (content, id) => new Promise(resolve => {
				const result = sass.renderSync({ file: id });
				resolve({ code: result.css.toString() });
			}),
			plugins: [
				autoprefixer
			],
			sourceMap: true,
			extract: true,
			extensions: [ '.sass', '.css' ]
		}),
		string({ include: "**/*.vbs" }),
		compiler(),
	],
	manualChunks(id) {
		if (id.includes('vpx-js')) {
			return 'vpx-js';
		}
		if (id.includes('node_modules')) {
			return 'vendor';
		}
	},
}
