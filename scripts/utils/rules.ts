import { Linter } from 'eslint';

import { pluginNames, plugins } from '../../src/setup/plugins.js';

import type {
	ApprovedRuleEntry,
	CustomNames,
	DeprecatedRule,
	NamedConfigEntry,
	RawRule,
	RuleEntry,
	RuleMeta,
} from '../types.ts';

const rulesEslint = new Linter().getRules();
const rulesImport = plugins[pluginNames.import].rules;

// Airbnb config uses eslint-plugin-import
// therefore some rules are prefixed with 'import'
export function findRawRule(name: string): RawRule | null {
	const isImportRule = name.startsWith('import');

	const key = isImportRule ? name.split('/')[1] : name;
	const raw = isImportRule ? rulesImport[key] : rulesEslint.get(key);

	return raw || null;
}

export function handleApprovedRule(
	rawRule: RawRule,
	ruleName: string,
	ruleValue: RuleEntry,
	rules: ApprovedRuleEntry[]
) {
	if (rawRule.meta && !rawRule.meta.deprecated) {
		rules.push([ruleName, ruleValue]);
		return true;
	}

	return false;
}

function findReplacedIn(ruleName: string) {
	const pluginKeys = [
		pluginNames.import,
		pluginNames.node,
		pluginNames.stylistic,
	];

	const [pluginImportKeys, pluginNodeKeys, pluginStylisticKeys] =
		pluginKeys.map((name) => {
			const { rules } = plugins[name];

			if (!rules) {
				throw Error(`Could not find any rules in plugin '${name}'`);
			}

			return Object.keys(rules);
		});

	const map = {
		[pluginNames.import]: pluginImportKeys,
		[pluginNames.node]: pluginNodeKeys,
		[pluginNames.stylistic]: pluginStylisticKeys,
	};

	const replacedIn: string = Object.values(pluginKeys).reduce(
		// (result, [name, rules]) => result !== null ? result : rules.includes(ruleName) ? name : result,
		// (result, name) => {
		// 	if (result) return result;
		// 	const rules = map[name];
		// 	if (rules.includes(ruleName)) return name;
		// 	return result;
		// },
		(result, pluginName) =>
			Boolean(result)
				? result
				: map[pluginName].includes(ruleName)
					? pluginName
					: '',
		''
	);

	return Boolean(replacedIn) ? replacedIn : undefined;
}

export function handleDeprecatedRule(
	configName: string,
	ruleName: string,
	ruleValue: RuleEntry,
	ruleMeta: RuleMeta | undefined,
	deprecatedRules: DeprecatedRule[],
	processedRules: ApprovedRuleEntry[]
) {
	const strippedName = ruleName.includes('/')
		? ruleName.split('/')[1]
		: ruleName;
	const pluginName = findReplacedIn(strippedName);

	const replacedBy =
		ruleMeta && ruleMeta.replacedBy ? ruleMeta.replacedBy[0] : undefined;
	const url = ruleMeta?.docs?.url;

	deprecatedRules.push({
		name: strippedName,
		value: ruleValue,
		config: configName,
		plugin: pluginName,
		replacedBy,
		url,
	});

	if (pluginName && pluginName !== pluginNames.stylistic) {
		processedRules.push([`${pluginName}/${strippedName}`, ruleValue]);
	}
}

export function isTypescriptRule(ruleName: string) {
	const pluginRules = Object.keys(plugins[pluginNames.typescript].rules);
	return pluginRules.includes(ruleName);
}

export function getTypescriptRuleName(ruleName: string) {
	const scope: CustomNames = 'typescript';
	return `${scope}/${ruleName}`;
}

export function getSortedRulesFromEntries(entries: NamedConfigEntry[]) {
	const all: ApprovedRuleEntry[] = [];

	entries.forEach(entry => {
		const { rules } = entry[1];

		if (!rules) {
			throw Error(`Could not find any rules in plugin '${entry[0]}'`);
		}

		all.push(...Object.entries(rules));
	});

	return all.sort(sortRulesByEntryName);
}

export function sortRulesByEntryName(a: ApprovedRuleEntry, b: ApprovedRuleEntry) {
	const nameA = a[0].toUpperCase();
	const nameB = b[0].toUpperCase();

	return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
}

export function sortRules(a: DeprecatedRule, b: DeprecatedRule) {
	const nameA = a.name.toUpperCase();
	const nameB = b.name.toUpperCase();

	return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
}
