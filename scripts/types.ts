import type { Linter, Rule } from 'eslint';

import names from './utils/names.ts';

const airbnbNameValues = Object.values(names.airbnb);
const customNameValues = Object.values(names.custom);
const configNameValues = Object.values(names.config);
const pluginNameValues = Object.values(names.plugin);

export type AirbnbNames = typeof airbnbNameValues[number];
export type CustomNames = typeof customNameValues[number];
export type ConfigNames = typeof configNameValues[number];
export type PluginNames = typeof pluginNameValues[number];

export type BaseConfig = Linter.BaseConfig;
export type FlatConfig = Linter.FlatConfig;
export type NamedFlatConfig = { name: string; } & FlatConfig;

export type BaseConfigEntry = [AirbnbNames, BaseConfig];
export type NamedConfigEntry = [ConfigNames, NamedFlatConfig];

export type RawRule = Rule.RuleModule;
export type RuleMeta = Rule.RuleMetaData;
export type RuleEntry = Linter.RuleEntry<any[]>;
export type RulesRecord = Linter.RulesRecord;

export type ApprovedRuleEntry = [string, RuleEntry];
export type DeprecatedRule = {
	name: string;
	value: RuleEntry;
	config: string;
	plugin: string | undefined;
	replacedBy: string | undefined;
	url: string | undefined;
};
