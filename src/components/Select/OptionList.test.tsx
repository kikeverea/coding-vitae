import { OptionGroup, OptionOrGroup, OptionType } from './OptionTypes'
import { beforeEach } from 'vitest'
import OptionList from './OptionList.tsx'

describe('Option List', () => {
  let options: OptionOrGroup[]
  let optionsNoGroups: OptionOrGroup[]

  let optionList: OptionList
  let optionListNoGroups: OptionList
  let optionListCreationEnabled: OptionList

  const optionsIndex = [0, 1, 3]
  const groupsIndex = [2, 4, 5]

  beforeEach(() => {
    // index and groupIndex included for testing purposes
    // not necessary to include when using this component, they will be managed
    // internally by OptionList

    options = [
      { name: "Option 1", value: "option-1" },
      { name: "Option 2", value: "option-2" },
      { group: "Group 1", index: 2, options: [
          { name: "Option 3", value: "option-3", groupIndex: 2 },
          { name: "Option 4", value: "option-4", groupIndex: 2 },
          { name: "Option 5", value: "option-5", groupIndex: 2 },
        ]
      },
      { name: "Option 6", value: "option-6" },
      { group: "Group 2", index: 4, options: [
          { name: "Option 7", value: "option-7", groupIndex: 4 },
          { name: "Option 8", value: "option-8", groupIndex: 4 },
          { name: "Option 9", value: "option-9", groupIndex: 4 },
        ]
      },
      { group: "Group 3", index: 5, options: [
          { name: "Option last", value: "option-last", groupIndex: 5 }
        ]
      }
    ]

    optionsNoGroups = [
      { name: "Option 1", value: "option-1" },
      { name: "Option 2", value: "option-2" },
      { name: "Option 3", value: "option-3" },
    ]

    optionList = new OptionList(options, false)
    optionListNoGroups = new OptionList(optionsNoGroups, true)
    optionListCreationEnabled = new OptionList(options, true)
  })

  test('inner state and options passed to the constructor are not the same instance', () => {
    expect((optionList as any).options).not.toBe(options)
  })

  test('options are initialized with their group index', () => {
    const options = (optionList as any).options

    const group1 = options[2] as OptionGroup
    const group2 = options[4] as OptionGroup

    group1.options.forEach(option => option.groupIndex === 2)
    group2.options.forEach(option => option.groupIndex === 4)
  })

  test('"empty" returns true if list has no options', () => {
    const empty = new OptionList([], false).empty()
    expect(empty).toBe(true)
  })

  describe('Find index', () => {
    test('finds an option index', () => {
      const index = optionsIndex[random(optionsIndex.length)]
      const option = options[index] as OptionType

      const found = optionList.findOptionIndex(option)

      expect(found).toBe(index)
    })

    test('finds an group option index', () => {
      const groupIndex = groupsIndex[random(groupsIndex.length)]
      const group = options[groupIndex] as OptionGroup

      const optionIndex = random(group.options.length)
      const option = group.options[optionIndex] as OptionType

      const found = optionList.findOptionIndex(option)

      expect(found).toStrictEqual([groupIndex, optionIndex])
    })
  })

  describe('Option getter', () => {
    test('gets option in given index', () => {
      const index = optionsIndex[random(optionsIndex.length)]
      const option = optionList.get(index)

      expect(option).toStrictEqual(options[index])
    })

    test('gets option group in given index', () => {
      const groupIndex = groupsIndex[random(groupsIndex.length)]
      const group = options[groupIndex] as OptionGroup

      const optionIndex = random(group.options.length)
      const option = optionList.get([groupIndex, optionIndex])

      expect(option).toStrictEqual(group.options[optionIndex])
    })
  })

  describe('First Index', () => {
    test('returns the first option index', () => {
      expect(optionList.firstIndex()).toEqual(0)
    })

    test('returns the first option group index', () => {
      const groupFirstOptions = options.filter((_a, index) => index > 1)
      const testOptionList = new OptionList(groupFirstOptions)

      expect(testOptionList.firstIndex()).toEqual([0, 0])
    })
  })

  describe('Previous Index', () => {
    test('returns the first option index if index is null', () => {
      expect(optionList.previousIndex(null)).toBe(0)
    })

    test('returns the previous option index', () => {
      expect(optionList.previousIndex(1)).toBe(0)
    })

    test('returns the previous option group index', () => {
      expect(optionList.previousIndex(3)).toStrictEqual([2, 2])
    })

    test('returns the previous option index inside a group', () => {
      expect(optionList.previousIndex([2, 2])).toStrictEqual([2, 1])
    })

    test('returns the previous option index outside a group', () => {
      expect(optionList.previousIndex([2, 0])).toBe(1)
    })

    test('returns the previous option index in another group', () => {
      expect(optionList.previousIndex([5, 0])).toStrictEqual([4, 2])
    })

    test('returns the same index if is first', () => {
      expect(optionList.previousIndex(0)).toBe(0)
    })
  })

  describe('Next Index', () => {
    test('returns the first option index if index is null', () => {
      expect(optionList.nextIndex(null)).toBe(0)
    })

    test('returns the next option index', () => {
      expect(optionList.nextIndex(0)).toBe(1)
    })

    test('returns the next option group index', () => {
      expect(optionList.nextIndex(1)).toStrictEqual([2, 0])
    })

    test('returns the next option index inside a group', () => {
      expect(optionList.nextIndex([2, 0])).toStrictEqual([2, 1])
    })

    test('returns the next option index outside a group', () => {
      expect(optionList.nextIndex([2, 2])).toBe(3)
    })

    test('returns the next option index in another group', () => {
      expect(optionList.nextIndex([4, 2])).toStrictEqual([5, 0])
    })

    test('returns the same index if is last', () => {
      expect(optionList.nextIndex([5, 0])).toStrictEqual([5, 0])
    })
  })

  describe('Filter options', () => {
    test('without a filter, return all options', () => {
      expect(optionList.filter()).toStrictEqual(options)
      expect(optionList.filter('')).toStrictEqual(options)
      expect(optionList.filter(null)).toStrictEqual(options)
    })

    test('with a filter, return filtered options', () => {
      expect(optionList.filter('Option 1')).toStrictEqual([options[0]])
      expect(optionList.filter('Option 2')).toStrictEqual([options[1]])
      expect(optionList.filter('Option')).toStrictEqual(options)
    })

    test('if a filter is inside a group, return that group with filtered options', () => {
      const group = options[4] as OptionGroup
      const expectedGroup = { ...group, options: [group.options[1]] }

      expect(optionList.filter('Option 8')).toEqual([expectedGroup])
    })

    test('returns empty array if no options pass the filter', () => {
      expect(optionList.filter('Option 123')).toEqual([])
    })

    test('if creation enabled, returns creation prompt if no options pass the filter', () => {
      const filtered = optionListNoGroups.filter('Option 123')[0] as OptionType
      expect(filtered.name).toEqual('Create Option 123')
    })

    test('if creation enabled with groups, returns creation prompt for every group, if no options pass the filter',
      () =>
    {
      const filtered = optionListCreationEnabled.filter('Option 123')

      const expected = [
        { group: "Group 1", options: [{ name: "Create Option 123", value: "option-123", groupIndex: 2 }], index: 2 },
        { group: "Group 2", options: [{ name: "Create Option 123", value: "option-123", groupIndex: 4 }], index: 4 },
        { group: "Group 3", options: [{ name: "Create Option 123", value: "option-123", groupIndex: 5 }], index: 5 }
      ]

      expect(filtered).toEqual(expected)
    })
  })

  describe('With option creation', () => {

    test('creates an option and returns it along with its index', () => {
      const [createdOption, createdIndex, group] = optionList.createOption('Create Option')

      const options = (optionList as any).options

      expect(options[options.length - 1]).toEqual(createdOption)
      expect(options.length - 1).toEqual(createdIndex)
      expect(group).not.toBeDefined()
    })

    test('creates an option in a group and returns it along with its index and group', () => {
      const groupIndex = 2
      const group = options[2] as OptionGroup
      const [createdOption, createdIndex, inGroup] = optionList.createOption('Create Option', groupIndex)

      expect(group.options[group.options.length - 1]).toEqual(createdOption)
      expect([groupIndex, group.options.length - 1]).toEqual(createdIndex)
      expect(inGroup).toEqual(group)
    })
  })

  describe('Find options by value', () => {
    test('find an option with the given value', () => {
      const group2 = options[4] as OptionGroup
      const option8 = group2.options[1]

      const found = optionList.findOptionsWithValue('option-8')
      expect(found).toEqual(option8)
    })

    test('find options with the given values', () => {
      const group1 = options[2] as OptionGroup
      const group3 = options[5] as OptionGroup

      const option2 = options[1]
      const option5 = { ...group1.options[2], groupIndex: 2 }
      const optionLast = { ...group3.options[0], groupIndex: 5 }

      const found = optionList.findOptionsWithValue(['option-2', 'option-5', 'option-last'])
      expect(found).toEqual([option2, option5, optionLast])
    })
  })
})

const random = (max: number): number => {
  return Math.floor(Math.random() * max)
}