import { OptionGroup, OptionIndex, OptionOrGroup, OptionType } from './OptionTypes'
import {isGroup, isGroupIndex, dasherize, createOptionPrompt, firstIndex} from './OptionsUtil'

class OptionList {
  private readonly options: OptionOrGroup[]
  private readonly showCreateOptionPrompt

  constructor(options: OptionOrGroup[], showCreateOptionPrompt?: boolean) {
    this.options = this.initOptions(options)
    this.showCreateOptionPrompt = !!showCreateOptionPrompt
  }

  private getGroup = (groupIndex: number): OptionGroup => this.options[groupIndex] as OptionGroup
  
  private initOptions(options: OptionOrGroup[]): OptionOrGroup[] {
    return options.map((optionOrGroup, index) => {

      optionOrGroup = { ...optionOrGroup }

      if (isGroup(optionOrGroup)) {
        const group = optionOrGroup
        group.index = index
        group.options.forEach(option => option.groupIndex = index)
      }

      return optionOrGroup
    })
  }

  empty(): boolean {
    return this.options.length === 0
  }

  firstIndex(): number | readonly [number, number] | null {
    return this.empty()
      ? null
      : isGroup(this.options[0]) ? [0, 0] : 0
  }

  findOptionIndex (findOption: OptionType): OptionIndex {
    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i]

      if (isGroup(option)) {
        const index = option.options.findIndex(groupOption => groupOption.value === findOption.value)

        if (index !== -1)
          return [i, index]
      }
      else if (option.value === findOption.value) {
        return i
      }
    }

    return this.options.length -1
  }

  nextIndex(index: OptionIndex | null): OptionIndex {
    if (index === null)
      return firstIndex(this.options)

    if (isGroupIndex(index)) {
      let [groupIndex, optionIndex] = index
      const optionGroup = this.options[groupIndex] as OptionGroup
      const groupOptions = optionGroup.options

      const nextIndex = groupIndex + 1
      const nextOptionIndex = optionIndex + 1
      const exitGroup = nextOptionIndex === groupOptions.length
      const wasLastIndex = nextIndex === this.options.length

      if (wasLastIndex)
        return [groupIndex, optionIndex]          // don't move, there is nothing ahead

      else if (exitGroup)
        return isGroup(this.options[nextIndex])
          ? [nextIndex, 0]                        // move to first option in next group
          : nextIndex                             // move to the next option

      else return [groupIndex, nextOptionIndex]   // stay in group, move to next option
    }

    const nextIndex = Math.min(index + 1, this.options.length - 1)

    return isGroup(this.options[nextIndex])
      ? [nextIndex, 0]
      : nextIndex
  }

  previousIndex(index: OptionIndex | null): OptionIndex {
    if (index === null)
      return firstIndex(this.options)

    if (isGroupIndex(index)) {
      let [groupIndex, optionIndex] = index

      const previousIndex = groupIndex - 1
      const previousOptionIndex = optionIndex - 1
      const exitGroup = previousOptionIndex === -1
      const wasFirstIndex = previousIndex === -1
      const previousGroup = this.options[previousIndex] as OptionGroup

      if (wasFirstIndex)
        return [groupIndex, optionIndex]                         // don't move, there is nothing before

      else if (exitGroup)
        return isGroup(this.options[previousIndex])             // previous index is group
          ? [previousIndex, previousGroup.options.length - 1]   // move to last option in previous group
          : previousIndex                                       // move to the previous option

      else return [groupIndex, previousOptionIndex]             // stay in group, move to previous option
    }

    const previousIndex = Math.max(index - 1, 0)
    const previousGroup = this.options[previousIndex] as OptionGroup

    return isGroup(this.options[previousIndex])
      ? [previousIndex, previousGroup.options.length - 1]
      : previousIndex
  }

  get(index: OptionIndex): OptionType {
    if (isGroupIndex(index)) {
      const [groupIndex, optionIndex] = index
      const group = this.options[groupIndex] as OptionGroup

      return group.options[optionIndex]
    }

    return this.options[index] as OptionType
  }

  filter(filter?: string | null): OptionOrGroup[] {
    if (!filter)
      return this.options

    const filtered = this.options.reduce((filteredOptions: OptionOrGroup[], option: OptionOrGroup) => {

      if (isGroup(option)) {

        const group = { ...option }

        const filteredGroupOptions =
          group.options.filter(option => option.name.toLowerCase().includes(filter.toLowerCase()))

        group.options = filteredGroupOptions.length > 0
          ? filteredGroupOptions
          : this.showCreateOptionPrompt
            ? [{ name: createOptionPrompt(filter), value: dasherize(filter), groupIndex: group.index }]
            : []

        group.options.length > 0 && filteredOptions.push(group)
      }
      else {
        const passesFilter = option.name.toLowerCase().includes(filter.toLowerCase())
        passesFilter && filteredOptions.push(option)
      }

      return filteredOptions
    },
    [])

    return filtered.length === 0 && this.showCreateOptionPrompt
      ? [{ name: createOptionPrompt(filter), value: dasherize(filter) }]
      : filtered
  }

  createOption(name: string, groupIndex?: number): readonly [OptionType, OptionIndex, OptionGroup?] {
    const option = { name, value: dasherize(name), groupIndex }

    if (groupIndex) {
      const group = this.getGroup(groupIndex)
      const optionIndex: OptionIndex = [groupIndex, group.options.length]

      group.options.push(option)
      return [option, optionIndex, group]
    }
    else {
      this.options.push(option)
      return [option, this.options.length - 1]
    }
  }

  findOptionsWithValue(value: string | string[]): OptionType | OptionType[] {
    const found = this.options.reduce((found: OptionType[], option: OptionOrGroup): OptionType[] => {
        if (isGroup(option)) {
          const foundInGroup = option.options.filter(option => this.optionHasValue(option, value)) || []
          return [...found, ...foundInGroup]
        }
        else {
          const valueMatches = this.optionHasValue(option, value)
          return valueMatches ? [...found, option] : found
        }
      },
      [])

    const multiple = Array.isArray(value)
    return multiple ? found : found[0]
  }

  optionHasValue(option: OptionType, value: string | string[]): boolean {
    return Array.isArray(value)
      ? value.includes(option.value)
      : value === option.value
  }
}

export default OptionList