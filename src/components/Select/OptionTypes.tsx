export type OptionType = {
  name: string
  value: string
  groupIndex?: number
}

export type OptionGroup = {
  group: string
  options: OptionType[],
  index?: number
}

export type OptionOrGroup = OptionType | OptionGroup

export type OptionIndex = number | readonly [number, number]