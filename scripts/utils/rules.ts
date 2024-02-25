import { Linter, type Rule } from 'eslint';

import type {
	FlatConfig,
	AirbnbConfigs,
	AirbnbConfigKeys,
	ConfigWithPluginKeys,
} from '../types/configs.ts';

import type {
	ProcessedRule,
	ApprovedMeta,
	DeprecatedMeta,
} from '../types/rules.ts';

import { pluginPrefix } from '../../src/plugins.ts';

import { airbnbConfigKeyValues } from './constants.ts';

import { getPluginPrefix } from './plugins.ts';

import rawRules from './rawRules.ts';

// extract, classify and sort all rules
// from eslint-config-airbnb-base
export function getRules(configs: AirbnbConfigs) {
	const rules: ProcessedRule[] = [];
	// const names = Object.keys(configs) as AirbnbNames[];

	airbnbConfigKeyValues.forEach((configName) => {
		const configFlat = configs[configName];

		if (!configFlat.rules) return;

		Object.entries(configFlat.rules).forEach(([
			ruleName, ruleValue,
		]) => {
			rules.push(getProcessedRule(configName, ruleName, ruleValue));
		});
	});

	return rules.sort(sortRules);
}

export function getApprovedRules(rules: ProcessedRule[]) {
	const isApprovedRule = (
		rule: ProcessedRule,
	): rule is ProcessedRule<ApprovedMeta> => (
		!rule.meta.deprecated && !rule.meta.plugin
	);

	const filtered: ProcessedRule<ApprovedMeta>[] = [];

	rules.forEach((rule) => {
		if (isApprovedRule(rule)) {
			filtered.push(rule);
		}
	});

	return filtered;
}

export function getPluginRules(rules: ProcessedRule[]) {
	return rules.filter((rule: ProcessedRule) => rule.meta.plugin);
}

export function getLegacyRules(rules: ProcessedRule[]) {
	const isDeprecatedRule = (
		rule: ProcessedRule,
	): rule is ProcessedRule<DeprecatedMeta> => rule.meta.deprecated;

	const filtered: ProcessedRule<DeprecatedMeta>[] = [];

	rules.forEach((rule) => {
		if (isDeprecatedRule(rule)) {
			filtered.push(rule);
		}
	});

	return filtered;
}

// @todo filter replacedBy rules
// export function getReplacedRules(rules: ProcessedRule[]) {
// return rules.filter((rule: ProcessedRule) => rule.meta.deprecated && rule.meta.replacedBy);
// }

function getProcessedRule(
	config: AirbnbConfigKeys,
	name: string,
	value: Linter.RuleEntry,
): ProcessedRule {
	// Airbnb config uses eslint-plugin-import
	// therefore some rules are prefixed with 'import'
	const isImportsRule = name.includes('/') && name.startsWith(pluginPrefix.import);

	// get meta from eslint/import rules
	const key = isImportsRule ? name.split('/')[1] : name;
	const raw = rawRules.getAirbnbRule(key, isImportsRule);

	// classify as deprecated or as approved
	let meta: ApprovedMeta | DeprecatedMeta = {
		deprecated: false,
		config,
		plugin: isImportsRule ? pluginPrefix.import : undefined,
	};

	if (!raw || (raw.meta && raw.meta.deprecated)) {
		meta = Object.assign(meta, {
			deprecated: true,
			...getDeprecatedMeta(key, raw?.meta),
		});
	}

	return {
		name: key,
		meta,
		value,
	};
}

function getDeprecatedMeta(name: string, meta: Rule.RuleMetaData | undefined) {
	const plugin = rawRules.getReplacedIn(name);

	const replacedBy = meta && meta.replacedBy ? meta.replacedBy[0] : undefined;
	const url = meta?.docs?.url;

	return {
		plugin,
		replacedBy,
		url,
	};
}

export function copyRules(
	key: AirbnbConfigKeys,
	source: ProcessedRule[],
	target: FlatConfig,
) {
	target.rules = source
		.filter((rule) => rule.meta.config === key)
		.reduce(
			(all, rule) => Object.assign(all, { [rule.name]: rule.value }),
			{},
		);
}

export function copyPluginRules(
	key: ConfigWithPluginKeys,
	source: ProcessedRule[],
	target: Linter.FlatConfig,
) {
	const rules = getPrefixedRules(key, source);

	if (key === 'node') {
		disableDeprecatedPluginRules(key, rules);
	}

	if (key === 'imports') {
		overwriteImportsRules(rules);
	}

	target.rules = rules;
}

function getPrefixedRules(
	key: ConfigWithPluginKeys,
	source: ProcessedRule[],
): Linter.RulesRecord {
	const plugin = getPluginPrefix(key);
	return source
		.filter((rule) => rule.meta.plugin === plugin)
		.reduce(
			(all, rule) => Object.assign(all, { [`${plugin}/${rule.name}`]: rule.value }),
			{},
		);
}

function disableDeprecatedPluginRules(
	key: ConfigWithPluginKeys,
	target: Linter.RulesRecord,
) {
	const plugin = getPluginPrefix(key);

	(Object.entries(rawRules[plugin]) as [string, Rule.RuleModule][])
		.filter((entry) => entry[1].meta?.deprecated)
		.forEach((entry) => {
			target[`${plugin}/${entry[0]}`] = 0;
		});

	// @todo sort by name
}

function overwriteImportsRules(target: Linter.RulesRecord) {
	// @todo types

	const noExtraneousDepsKey = 'import/no-extraneous-dependencies';
	const noExtraneousDepsVals = target[
		noExtraneousDepsKey
	] as Linter.RuleLevelAndOptions; // ??

	const [
		severity, dependants,
	] = noExtraneousDepsVals;

	// target.rules['import/named'] = 0;
	target[noExtraneousDepsKey] = [
		severity, {
			devDependencies: [
				...dependants.devDependencies,
				'**/eslint.config.js',
				'**/vite.config.js',
				'**/vite.config.*.js',
			],
			optionalDependencies: dependants.optionalDependencies,
		},
	];
}

export function copyLegacyRules(
	source: ProcessedRule<DeprecatedMeta>[],
	target: Linter.FlatConfig,
) {
	const rules: Linter.RulesRecord = {};

	source
		.filter((rule) => rule.meta.plugin !== 'import')
		.forEach((rule) => {
			rules[rule.name] = 0;
		});

	target.rules = rules;
}

export function copyTypescriptRules(
	source: ProcessedRule[],
	target: Linter.FlatConfig,
) {
	const filtered = source.filter((rule) => isTypescriptRule(rule.name));
	const rules: Linter.RulesRecord = {};

	filtered.forEach((rule) => {
		// console.log(`'${rule.name}' is replaced in @typescript-eslint`);
		rules[rule.name] = 0;
	});

	filtered.forEach((rule) => {
		rules[`${pluginPrefix.typescript}/${rule.name}`] = rule.value;
	});

	target.rules = rules;
}

export function isTypescriptRule(name: string) {
	return rawRules.typescript.has(name);
}

// export function sortRulesByEntryName(
// 	a: ApprovedRuleEntry,
// 	b: ApprovedRuleEntry
// ) {
// 	const nameA = a[0].toUpperCase();
// 	const nameB = b[0].toUpperCase();

// 	return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
// }

export function sortRules(a: ProcessedRule, b: ProcessedRule) {
	const nameA = a.name.toUpperCase();
	const nameB = b.name.toUpperCase();

	return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
}
