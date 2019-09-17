const { resolve, relative } = require('path');
const esprima = require('esprima');
const acorn = require('acorn');
const traverse = require('estraverse');
const codegen = require('escodegen');

module.exports = function(source, map, meta) {
	if (this.cacheable) {
		this.cacheable();
	}

	if (this.resourcePath.endsWith('moo.js')) { // TODO retrieve this from module.noParse
		return source;
	}

	const filePath = 'webpack:///' + relative(resolve(__dirname, '..'), this.resourcePath).replace(/\\/g, '/');
	try {
		const ast = acorn.parse(source,  { sourceType: 'module' });
		const modifiedAst = traverse.replace(ast, {
			leave: node => {
				if (filePath.includes('alloc-log-collector')) {
					return node;
				}
				if (node.type !== 'NewExpression' && node.type !== 'ObjectExpression' && node.type !== 'ArrayExpression') {
					return node;
				}

				const key = `${filePath}:${findLine(source, node.start)}`;
				return {
					type: 'CallExpression',
					callee: {
						type: 'MemberExpression',
						object: {
							type: 'Identifier',
							name: '__alloc__'
						},
						property: {
							type: 'Identifier',
							name: 'instantiate'
						},
						computed: false
					},
					arguments: [
						node,
						{
							type: 'Literal',
							value: key,
							raw: `'${key}'`,
						}
					]
				};
			}
		});
		const result = codegen.generate(modifiedAst);

		if (this.sourceMap === false) {
			return this.callback(null, result);
		}

		this.callback(null, result);

	} catch (err) {
		console.error(source);
		console.error('----------- ERROR:', err);
		return this.callback(err);
	}
};

function findLine(src, charPos) {
	let linePos = 0;
	for (let i = 0; i < charPos; i++) {
		if (src[i] === '\r' || src[i] === '\n') {
			linePos++;
		}
		if (src[i + 1] === '\n') {
			i++;
		}
	}
	return linePos;
}
