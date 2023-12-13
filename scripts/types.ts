import type { Linter, Rule } from 'eslint';

export type BaseConfig = Linter.BaseConfig;
export type FlatConfig = Linter.FlatConfig;
export type NamedFlatConfig = { name: string } & FlatConfig;

export type BaseConfigEntry = [string, BaseConfig];
export type NamedConfigEntry = [string, NamedFlatConfig];

export type RawRule = Rule.RuleModule;
export type RuleMeta = Rule.RuleMetaData;
export type RuleEntry = Linter.RuleEntry<any[]>;
export type RulesRecord = Linter.RulesRecord;

export type ApprovedRule = [string, RuleEntry];
export type DeprecatedRule = {
	name: string;
	value: RuleEntry;
	config: string;
	plugin: string | undefined;
	replacedBy: string | undefined;
	url: string | undefined;
};
