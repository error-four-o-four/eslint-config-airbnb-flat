// FILE GENERATED WITH SCRIPT
export const airbnbNames = {
	bestPractices: 'best-practices',
	errors: 'errors',
	node: 'node',
	style: 'style',
	variables: 'variables',
	es6: 'es6',
	imports: 'imports',
	strict: 'strict',
} as const;

export const customNames = {
	disableLegacy: 'disable-legacy',
	stylistic: 'stylistic',
	typescript: 'typescript',
} as const;

export const configNames = {
	...airbnbNames,
	...customNames,
} as const;

export const pluginNames = {
	import: 'import',
	node: 'node',
	stylistic: 'stylistic',
	typescript: 'typescript',
} as const;

export default {
	airbnb: airbnbNames,
	custom: customNames,
	config: configNames,
	plugin: pluginNames,
};
