import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';

// @ts-expect-error missing types
import airbnb from 'eslint-config-airbnb-base';

import type {
	ApprovedRuleEntry,
	BaseConfig,
	BaseConfigEntry,
	CustomNames,
	DeprecatedRule,
	NamedConfigEntry,
	NamedFlatConfig,
	RulesRecord,
} from '../types.ts';

import {
	findRawRule,
	handleApprovedRule,
	handleDeprecatedRule,
	sortRulesByEntryName,
	sortRules,
	getSortedRulesFromEntries,
	isTypescriptRule,
	getTypescriptRuleName,
} from './rules.ts';

import { configNames, pluginNames } from './names.ts';

function promiseBaseConfig(item: string): Promise<BaseConfigEntry> {
	const name = path.basename(item, '.js');
	const file = pathToFileURL(item).href;

	return new Promise((resolve) => {
		import(file).then((module) => {
			const entry = [name, module.default] as BaseConfigEntry;
			resolve(entry);
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

	processedEntries.push(
		createLegacyConfig(prefix, configNames.disableLegacy, deprecatedRules),
	);

	processedEntries.push(
		createStylisticConfig(prefix, configNames.stylistic, deprecatedRules)
	);

	processedEntries.push(
		createTypescriptConfig(prefix, configNames.typescript, processedEntries)
	);

	return [processedEntries, deprecatedRules];
}

function processEntries(
	prefix: string,
	entries: BaseConfigEntry[]
): [NamedConfigEntry[], DeprecatedRule[]] {
	const processedEntries: NamedConfigEntry[] = [];
	const deprecatedRules: DeprecatedRule[] = [];

	entries.forEach(([configName, configBase]) => {
		const processedRules: ApprovedRuleEntry[] = [];

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
			convertConfig(prefix, configName, configBase, processedRules),
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
	prefix: string,
	name: string,
	base: BaseConfig,
	approved: ApprovedRuleEntry[]
): NamedFlatConfig {
	const sorted = approved.sort(sortRulesByEntryName);
	base.rules = Object.fromEntries(sorted);

	if (Object.hasOwn(base, 'plugins')) {
		delete base.plugins;
	}

	const named = { name: getPrefixedName(prefix, name) };

	return compat
		.config(base)
		.reduce((all, data) => Object.assign(all, data), named);
}

function getPrefixedName(prefix: string, name: string) {
	return `${prefix}:${name}`;
}

function createLegacyConfig(
	prefix: string,
	name: CustomNames,
	deprecated: DeprecatedRule[]
): NamedConfigEntry {
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

	const config = {
		name: getPrefixedName(prefix, name),
		rules,
	};

	return [name, config];
}

function createStylisticConfig(
	prefix: string,
	name: CustomNames,
	deprecated: DeprecatedRule[]
): NamedConfigEntry {
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

	const config = {
		name: getPrefixedName(prefix, name),
		rules,
	};

	return [name, config];
}

function createTypescriptConfig(
	prefix: string,
	name: CustomNames,
	entries: NamedConfigEntry[]
): NamedConfigEntry {
	const allRules = getSortedRulesFromEntries(entries);
	const rules: RulesRecord = {};

	allRules.forEach(([ruleName, ruleValue]) => {
		if (!isTypescriptRule(ruleName)) return;

		console.log(`'${ruleName}' is replaced in @typescript-eslint`);

		rules[ruleName] = 0;
		rules[getTypescriptRuleName(ruleName)] = ruleValue;
	});

	const config = {
		name: getPrefixedName(prefix, name),
		rules
	};

	return [name, config];
}
