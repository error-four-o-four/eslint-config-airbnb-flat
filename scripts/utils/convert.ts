import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';

// @ts-expect-error missing types
import airbnb from 'eslint-config-airbnb-base';

import type {
	ApprovedRule,
	BaseConfig,
	BaseConfigEntry,
	DeprecatedRule,
	NamedConfigEntry,
	NamedFlatConfig,
} from '../types.ts';
import {
	findRawRule,
	handleApprovedRule,
	handleDeprecatedRule,
	sortRulesByEntryName,
	sortRules,
} from './rules.ts';

import { pluginNames } from '../../src/setup/plugins.js';

function promiseBaseConfig(item: string) {
	const name = path.basename(item, '.js');
	const file = pathToFileURL(item).href;

	return new Promise((resolve) => {
		import(file).then((module) => {
			resolve([name, module.default]);
		});
	});
}

export async function importBaseConfigs(): Promise<BaseConfigEntry[]> {
	return Promise.all(airbnb.extends.map(promiseBaseConfig));
}

export function processConfigEntries(
	prefix: string,
	entries: BaseConfigEntry[]
): [NamedConfigEntry[], DeprecatedRule[]] {
	const [processedEntries, deprecatedRules] = processEntries(prefix, entries);

	const legacyConfigName = 'disable-legacy';
	processedEntries.push([
		legacyConfigName,
		createLegacyConfig(prefix, legacyConfigName, deprecatedRules),
	]);

	const stylisticConfigName = pluginNames.stylistic;
	processedEntries.push([
		stylisticConfigName,
		createStylisticConfig(prefix, stylisticConfigName, deprecatedRules),
	]);

	return [processedEntries, deprecatedRules];
}

function processEntries(
	prefix: string,
	entries: BaseConfigEntry[]
): [NamedConfigEntry[], DeprecatedRule[]] {
	const processedEntries: NamedConfigEntry[] = [];
	const deprecatedRules: DeprecatedRule[] = [];

	entries.forEach(([configName, configBase]) => {
		const processedRules: ApprovedRule[] = [];

		if (!configBase.rules) return;

		Object.entries(configBase.rules).forEach(([ruleName, ruleValue]) => {
			const rawRule = findRawRule(ruleName);

			if (!rawRule || !ruleValue) {
				console.error(`Could not find rule '${ruleName}'`);
				return;
			}

			if (handleApprovedRule(rawRule, ruleName, ruleValue, processedRules)) {
				console.info(`Approved rule '${ruleName}'`);
				return;
			}

			const ruleMeta = rawRule.meta;
			handleDeprecatedRule(
				configName,
				ruleName,
				ruleValue,
				ruleMeta,
				deprecatedRules,
				processedRules
			);
		});

		processedEntries.push([
			configName,
			convertConfig(`${prefix}:${configName}`, configBase, processedRules),
		]);
	});

	return [processedEntries, deprecatedRules];
}

const filename = fileURLToPath(import.meta.url);
const root = path.dirname(path.resolve(filename, '../..'));

const compat = new FlatCompat({
	baseDirectory: root,
});

function convertConfig(
	name: string,
	base: BaseConfig,
	approved: ApprovedRule[]
): NamedFlatConfig {
	const sorted = approved.sort(sortRulesByEntryName);
	base.rules = Object.fromEntries(sorted);

	if (Object.hasOwn(base, 'plugins')) {
		delete base.plugins;
	}

	const named = { name };

	return compat
		.config(base)
		.reduce((all, data) => Object.assign(all, data), named);
}

function createLegacyConfig(
	prefix: string,
	name: string,
	deprecated: DeprecatedRule[]
) {
	const rules = deprecated
		.filter((rule) => rule.plugin !== pluginNames.stylistic)
		.sort(sortRules)
		.reduce((all, item) => {
			const ruleName =
				item.plugin === pluginNames.import
					? `${item.plugin}/${item.name}`
					: item.name;
			return Object.assign(all, {
				[ruleName]: 0,
			});
		}, {});

	return {
		name: `${prefix}:${name}`,
		rules,
	};
}

function createStylisticConfig(
	prefix: string,
	name: string,
	deprecated: DeprecatedRule[]
) {
	const rules = deprecated
		.filter((rule) => rule.plugin === name)
		.sort(sortRules)
		.reduce(
			(all, item) =>
				Object.assign(all, {
					[`${name}/${item.name}`]: item.value,
				}),
			{}
		);

	return {
		name: `${prefix}:${name}`,
		rules,
	};
}

// @TODO create typescript config !
