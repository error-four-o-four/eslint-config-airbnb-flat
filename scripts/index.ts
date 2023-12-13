import { fileURLToPath } from 'node:url';

import { importBaseConfigs, processConfigEntries } from './utils/convert.ts';
import {
	createLogFileData,
	ensureFolder,
	toCamelCase,
	writeFile,
} from './utils/write.ts';

import type { NamedConfigEntry, NamedFlatConfig } from './types.ts';

import { pluginNames } from '../src/setup/plugins.js';

// EXECUTE

const NOTICE = '// FILE GENERATED WITH SCRIPT';

const metaUrl = import.meta.url;

run();

async function run() {
	const baseConfigEntries = await importBaseConfigs();

	// add prefixed property 'name' to FlatConfig
	const prefix = 'airbnb';

	// remove and collect deprecated rules
	// replace deprecated rules
	// convert base to flat config
	const [processedEntries, deprecatedRules] = processConfigEntries(
		prefix,
		baseConfigEntries
	);

	// best-practices
	// errors
	// ...
	const configEntriesAirbnb = processedEntries.filter(
		(entry) =>
			entry[0] !== 'disable-legacy' && entry[0] !== pluginNames.stylistic
	);

	const configEntryLegacy = processedEntries.find(
		(entry) => entry[0] === 'disable-legacy'
	);
	if (!configEntryLegacy) throw new Error('Oops. Something went wrong');

	const configEntryStylistic = processedEntries.find(
		(entry) => entry[0] === pluginNames.stylistic
	);
	if (!configEntryStylistic) throw new Error('Oops. Something went wrong');

	const baseDir = '../src/configs';
	ensureFolder(fileURLToPath(new URL(`${baseDir}/`, import.meta.url)));

	const airbnbDir = `${baseDir}/airbnb`;
	await writeConfigs(airbnbDir, configEntriesAirbnb);
	await writeConfigsEntryFile(`${airbnbDir}/index.js`, configEntriesAirbnb);

	const stylisticFile = `${baseDir}/${configEntryStylistic[0]}/index.js`;
	await writeConfigToFile(stylisticFile, configEntryStylistic[1]);

	const legacyFile = `${baseDir}/legacy/index.js`;
	await writeConfigToFile(legacyFile, configEntryLegacy[1]);

	const logFile = `../legacy.json`;
	const logData = createLogFileData(deprecatedRules);

	writeFile(metaUrl, logFile, logData, 'json');
}

async function writeConfigs(folder: string, entries: NamedConfigEntry[]) {
	await entries.reduce(async (chain, entry) => {
		await chain;
		const [name, data] = entry;
		const file = `${folder}/${name}.js`;
		return writeConfigToFile(file, data);
	}, Promise.resolve());
}

async function writeConfigToFile(file: string, config: NamedFlatConfig) {
	const data = `${NOTICE}
/** @type {import('eslint').Linter.FlatConfig} */
export default ${JSON.stringify(config)}`;

	await writeFile(metaUrl, file, data);
}

async function writeConfigsEntryFile(
	file: string,
	entries: NamedConfigEntry[]
) {
	const names = entries.map(([name]) => [toCamelCase(name), name]);

	let data = `${NOTICE}\n`;

	data += names
		.map(([camel, kebap]) => `import ${camel} from './${kebap}.js';`)
		.join('\n');

	data += '\n\nexport const all = {\n';
	data += names.map(([pascal]) => `${pascal},`).join('\n');
	data += '\n};\n\n';

	data += "/** @type {import('eslint').Linter.FlatConfig[]} */\n";
	data += 'export default Object.values(all);';

	// 	const data = `${NOTICE}
	// import bestPractice from './best-practices.js';
	// import errors from './errors.js';
	// import es6 from './es6.js';
	// import imports from './imports.js';
	// import node from './node.js';
	// import strict from './strict.js';
	// import style from './style.js';
	// import variables from './variables.js';
	// export const all = {
	// 	bestPractice,
	// 	errors,
	// 	es6,
	// 	imports,
	// 	node,
	// 	strict,
	// 	style,
	// 	variables,
	// };
	// /** @type {import('eslint').Linter.FlatConfig[]} */
	// export default Object.values(all);`;
	writeFile(metaUrl, file, data);
}
