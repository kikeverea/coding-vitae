import { OptionGroup, OptionIndex, OptionOrGroup, OptionType } from './OptionTypes'
import { isGroup, isGroupIndex, dasherize, createOptionPrompt } from './OptionsUtil'

class OptionList {
  private readonly options: OptionOrGroup[]
  private readonly showCreateOptionPrompt

  constructor(options: OptionOrGroup[], showCreateOptionPrompt: boolean) {
    this.options = this.initOptions(options)
    this.showCreateOptionPrompt = showCreateOptionPrompt
  }

  private getGroup = (groupIndex: number): OptionGroup => this.options[groupIndex] as OptionGroup
  
  private initOptions(options: OptionOrGroup[]): OptionOrGroup[] {
    for (let i = 0; i < options.length; i++) {
      const group = options[i]

      if (!isGroup(group))
        continue

      group.index = i
      group.options.forEach(option => option.groupIndex = i)
    }

    return options
  }

  initialFocusedIndex(): OptionIndex {
    return isGroup(this.options[0]) ? [0, 0] : 0
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

  nextIndex(index: OptionIndex): OptionIndex {
    if (isGroupIndex(index)) {
      let [groupIndex, optionIndex] = index
      const optionGroup = this.options[groupIndex] as OptionGroup
      const groupOptions = optionGroup.options

      const nextGroupIndex = groupIndex + 1
      const nextOptionIndex = optionIndex + 1
      const moveToNextGroup = nextOptionIndex === groupOptions.length
      const isLastGroup = nextGroupIndex === this.options.length

      return moveToNextGroup
        ? isLastGroup
          ? [groupIndex, optionIndex]   // remain unchanged
          : [nextGroupIndex, 0]         // move to first option in next group
        : [groupIndex, nextOptionIndex] // move to next option in same group
    }

    return Math.min(index + 1, this.options.length - 1)
  }

  previousIndex(index: OptionIndex): OptionIndex {
    if (isGroupIndex(index)) {
      let [groupIndex, optionIndex] = index

      const previousGroupIndex = groupIndex - 1
      const previousOptionIndex = optionIndex - 1
      const moveToPreviousGroup = previousOptionIndex === -1
      const isFirstGroup = previousGroupIndex === -1
      const previousGroup = this.options[previousGroupIndex] as OptionGroup

      return moveToPreviousGroup
        ? isFirstGroup
          ? [groupIndex, optionIndex]                               // remain unchanged
          : [previousGroupIndex, previousGroup.options.length -1]   // move to last option in previous group
        : [groupIndex, previousOptionIndex]                         // move to previous option in same group
    }

    return Math.max(index - 1, 0)
  }

  get(index: OptionIndex): OptionType {
    if (isGroupIndex(index)) {
      const [groupIndex, optionIndex] = index
      const group = this.options[groupIndex] as OptionGroup

      return group.options[optionIndex]
    }

    return this.options[index] as OptionType
  }

  filter(filter: string): OptionOrGroup[] {
    return this.options.reduce((filteredOptions: OptionOrGroup[], option: OptionOrGroup) => {

      if (isGroup(option)) {
        const group = option
        const filteredGroupOptions =
          group.options.filter(option => option.name.toLowerCase().includes(filter.toLowerCase()))
        
        group.options = filteredGroupOptions.length > 0
          ? filteredGroupOptions
          : this.showCreateOptionPrompt
            ? [{ name: createOptionPrompt(filter), value: dasherize(filter), groupIndex: group.index }]
            : []
          
        filteredOptions.push(group)
      }
      else {
        const passesFilter = option.name.toLowerCase().includes(filter.toLowerCase())
        passesFilter && filteredOptions.push(option)
      }
      
      return filteredOptions
    },
    [])
  }

  findOptionsWithValue(value: string | string[], options: OptionOrGroup[], multiple: boolean): OptionType | OptionType[] {

    const found = options.reduce((found: OptionType[], option: OptionOrGroup): OptionType[] => {
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

    return multiple ? found : found[0]
  }

  optionHasValue(option: OptionType, value: string | string[]): boolean {
    return Array.isArray(value)
      ? value.includes(option.value)
      : value === option.value
  }
  
  createOption(name: string, groupIndex?: number): readonly [OptionType, OptionIndex] {
    const option = { name, value: dasherize(name), groupIndex }
    
    if (groupIndex) {
      const group = this.getGroup(groupIndex) 
      const optionIndex: OptionIndex = [groupIndex, group.options.length - 1]
      
      group.options.push(option)
      return [option, optionIndex]
    }
    else {
      this.options.push(option)
      return [option, this.options.length - 1]
    }
  }
}

export default OptionList