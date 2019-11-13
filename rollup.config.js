import nodeResolve from "rollup-plugin-node-resolve";
import sass from 'rollup-plugin-sass';
import { string } from 'rollup-plugin-string';
import OMT from "rollup-plugin-off-main-thread";

export default {
	input: "src/index.js",
	output: {
		dir: "dist",
		format: "amd"
	},
	plugins: [
		nodeResolve({ browser: true }),
		OMT(),
		sass(),
		string({ include: "**/*.vbs" }),
	],
}
