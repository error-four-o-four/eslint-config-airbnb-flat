import { basename } from 'node:path';

// @ts-expect-error missing types
import airbnb from 'eslint-config-airbnb-base';

import { toCamelCase, writeFile } from './utils/write.ts';

const airbnbNames: string[] = airbnb.extends.map((item: string) => basename(item, '.js'));

const toKeyValuePair = (array: string[]) => array.map((name: string) => `${toCamelCase(name)}: '${name}',`).join('\n');

const file = './utils/names.ts';
const data = `// FILE GENERATED WITH SCRIPT
export const airbnbNames = {
	${toKeyValuePair(airbnbNames)}
} as const;

export const customNames = {
	${toKeyValuePair(['disable-legacy', 'stylistic', 'typescript'])}
} as const;

export const configNames = {
	...airbnbNames,
	...customNames
} as const;

export const pluginNames = {
	${toKeyValuePair(['import', 'node', 'stylistic', 'typescript'])}
} as const;

export default {
	${['airbnb', 'custom', 'config', 'plugin'].map(name => `${name}: ${name}Names,`).join('\n')}
}
`;

writeFile(import.meta.url, file, data, 'typescript');