import {OptionGroup, OptionIndex, OptionOrGroup} from "./OptionTypes.tsx";

export const isGroup = (_optionOrGroup: OptionOrGroup): _optionOrGroup is OptionGroup => 'group' in _optionOrGroup
export const isGroupIndex = (index: OptionIndex): index is readonly [number, number] => Array.isArray(index)
export const dasherize = (str: string): string => str.toLowerCase().replace(/\s/g, '-')
export const createOptionPrompt = (optionName: string): string => `Create ${optionName}`
export const isCreateOptionPrompt = (prompt: string, compare: string): boolean => prompt === createOptionPrompt(compare)