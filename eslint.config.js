import pluginPrettier from 'eslint-plugin-prettier';
import defineBaseConfig from './tmp/base.min.js';

const message = 'linting ...';
console.log(`\u001b[33m${message}\u001b[0m`);

export default defineBaseConfig(
	{
		ignores: ['**/dist/*', '**/tmp/*'],
	},
	{
		name: 'custom:prettier',
		plugins: {
			prettier: pluginPrettier,
		},
		rules: {
			'prettier/prettier': 'warn',
		},
	},
	{
		name: 'custom:overrides',
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
		rules: {
			'import/extensions': ['error', 'ignorePackages', { js: 'always' }],
		},
	},
	{
		name: 'custom:overrides-node',
		files: ['scripts/**/*.js', 'eslint.config.js'],
		rules: {
			'no-console': 0,
			'no-nested-ternary': 0,
			'no-param-reassign': 0,
			'no-use-before-define': 0,
			'import/no-extraneous-dependencies': 0,
		},
	}
);
