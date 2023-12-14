import { dirname, sep } from 'node:path';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { BuiltInParserName, Options } from 'prettier';
import prettier from 'prettier';

import { DeprecatedRule } from '../types.ts';
import { sortRules } from './rules.ts';

const prettierBaseOptions = await prettier.resolveConfig(
	new URL('../../.prettierrc.json', import.meta.url)
);

export async function prettify(
	input: string,
	parser: BuiltInParserName = 'espree'
) {
	const options: Options = {
		...prettierBaseOptions,
		parser,
	};

	return await prettier.format(input, options);
}

export function toCamelCase(input: string) {
	const r =
		/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g;
	const m = input.match(r);

	if (!m) return input;

	const s = Array.isArray(m)
		? m
			.map((x) => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
			.join('')
		: input;

	return s.slice(0, 1).toLowerCase() + s.slice(1);
}

export function ensureFolder(path: string) {
	const folder = path.endsWith(sep) ? path : dirname(path);
	if (!existsSync(folder)) mkdirSync(folder);
}

export async function writeFile(
	meta: string,
	file: string,
	data: string,
	parser: BuiltInParserName = 'espree'
) {
	const path = fileURLToPath(new URL(file, meta));
	const output = await prettify(data, parser);
	ensureFolder(path);
	writeFileSync(path, output, { flag: 'w+' });
	console.log('Written data to', path);
}

// DEPRECATED LOG

export function createLogFileData(rules: DeprecatedRule[]) {
	return JSON.stringify(
		rules.sort(sortRules).reduce(
			(all, rule) => {
				const { plugin } = rule;

				delete rule.plugin;

				if (plugin) {
					if (!all[plugin]) all[plugin] = [];
					all[plugin].push(rule);
				} else {
					if (!all.legacy) all.legacy = [];
					all.legacy.push(rule);
				}

				return all;
			},
			{} as {
				[x: string]: DeprecatedRule[];
			}
		)
	);
}
