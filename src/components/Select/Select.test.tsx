import {fireEvent, render, screen, within} from '@testing-library/react'
import Select from './Select'
import {OptionGroup, OptionOrGroup, OptionType} from './OptionTypes'
import { userEvent, UserEvent } from '@testing-library/user-event'
import { JSX } from 'react'
import {Mock, vi} from 'vitest'

type OptionIndexSet = 0 | 1 | 3
type GroupIndexSet = 2 | 4 | 5

describe('Select', () => {

  const options: OptionType[] = [
    { name: "Option 1", value: "option-1" },
    { name: "Option 2", value: "option-2" },
    { name: "Option 3", value: "option-3" }
  ]

  const separatedOptions: OptionOrGroup[] = [
    { name: "Option 1", value: "option-1" },
    { name: "Option 2", value: "option-2" },
    { name: "Option 3", value: "option-3" }
  ]

  const groupedOptions: OptionOrGroup[] = [
    { name: "Option 1", value: "option-1" },
    { name: "Option 2", value: "option-2" },
    { group: "Group 1", options: [
        { name: "Option 3", value: "option-3" },
        { name: "Option 4", value: "option-4" },
        { name: "Option 5", value: "option-5" },
      ]
    },
    { name: "Option 6", value: "option-6" },
    { group: "Group 2", options: [
        { name: "Option 7", value: "option-7" },
        { name: "Option 8", value: "option-8" },
        { name: "Option 9", value: "option-9" },
      ]
    },
    { group: "Group 3", options: [
        { name: "Option last", value: "option-last" }
      ]
    }
  ]

  let user: UserEvent
  let selectElement: HTMLElement
  let searchbox: HTMLInputElement
  let listbox: HTMLElement
  let optionElements: HTMLOptionElement[]

  const getOption = (
    index: number,
    fromOptions: OptionType[] = options,
    fromElements: HTMLOptionElement[] = optionElements): [OptionType, HTMLOptionElement] =>
  {
    return [fromOptions[index], fromElements[index]]
  }

  const getGroupedOption = (
    index: OptionIndexSet | [GroupIndexSet, 0 | 1 | 2],
    fromOptions: OptionOrGroup[] = groupedOptions,
    fromElements: HTMLOptionElement[] = optionElements): [OptionType, HTMLElement] =>
  {
    if (Array.isArray(index)) {
      const [groupIndex, optionIndex] = index
      const [group, groupElement] = getGroup(groupIndex, fromOptions, fromElements)
      return [group.options[optionIndex], groupElement.children[optionIndex] as HTMLElement]
    }
    else return [fromOptions[index] as OptionType, fromElements[index] as HTMLElement]
  }

  const getGroup = (
    index: 2 | 4 | 5,
    fromOptions: OptionOrGroup[] = groupedOptions,
    fromElements: HTMLElement[] = optionElements): [OptionGroup, HTMLElement] =>
  {

    return [fromOptions[index] as OptionGroup, fromElements[index]]
  }

  const randomIndex = () => Math.floor(Math.random() * options.length)

  const randomGroupedOptionIndex = (): 0 | 1 | 3 => {
    const optionIndices: [0, 1, 3] = [0, 1, 3]
    return optionIndices[Math.floor(Math.random() * optionIndices.length)]
  }

  // TODO make some code for Ruby/Rails methods like this one
  const dasherize = (str: string): string => str.toLowerCase().replace(/\s/g, '-')

  beforeEach(() => {
    user = userEvent.setup()
  })

  describe('With no options', () => {
    test('without options, renders empty message', () => {
      render(<Select options={[]} expanded={ true }/>)

      optionElements = screen.getAllByRole('option')

      expect(optionElements.length).toBe(1)
      expect(optionElements[0].textContent).toBe('No data available')
    })

    test('without options, and a given empty message, renders said message', () => {
      render(<Select options={[]} expanded={ true } noDataMessage='empty message'/>)

      optionElements = screen.getAllByRole('option')
      expect(optionElements[0].textContent).toBe('empty message')
    })
  })

  describe('With collapsed dropdown', () => {
    beforeEach(async () => {
      render(<Select options={ options } placeholder={ 'Test placeholder' }/>)
      selectElement = screen.getByRole('combobox')
    })

    test('dropdown list is not rendered by default', () => {
      const dropdown = screen.queryByRole('listbox')
      expect(dropdown).toBeNull()
    })

    test('placeholder is visible', () => {
      const display = screen.getByTestId('display-content')
      expect(display.textContent).toBe('Test placeholder')
    })

    test('no option is selected', () => {
      const valueInput: HTMLInputElement = screen.getByTestId('selected-option-value')
      expect(valueInput.value).toBe('')
    })

    test('clicking on the select component shows the dropdown list', async () => {
      await user.click(selectElement)

      const dropdown = screen.getByRole('listbox')
      expect(dropdown).toBeDefined()
      expect(selectElement.ariaExpanded).toBe('true')
    })
  })

  describe('With expanded dropdown', () => {

    beforeEach(async () => {
      render(<Select options={ options } placeholder={ 'Test placeholder' } expanded={ true }/>)
      selectElement = screen.getByRole('combobox')
      optionElements = screen.getAllByRole('option')
    })

    test('clicking on the select component collapses the dropdown', async () => {
      await user.click(selectElement)

      const dropdown = screen.queryByRole('listbox')
      expect(dropdown).toBeNull()
      expect(selectElement.ariaExpanded).toBe('false')
    })

    test('with options, renders options', () => {
      const optionElements: HTMLOptionElement[] = screen.getAllByRole('option')
      expect(optionElements.length).toBe(3)

      optionElements.forEach((optionElement, index) =>
        expect(optionElement.textContent).toBe(`Option ${index + 1}`))
    })

    test('renders searchbox', () => {
      const input: HTMLInputElement = screen.getByRole('searchbox')
      expect(input.type).toBe('search')
    })

    test('searchbox is focused by default', () => {
      const input: HTMLInputElement = screen.getByRole('searchbox')

      const focused = document.activeElement

      expect(focused).toBeDefined()
      expect(focused?.id).toBe(input.id)
    })

    test('filters options by search', async () => {
      const input: HTMLInputElement = screen.getByRole('searchbox')

      await user.type(input, "option")

      optionElements = screen.queryAllByRole('option')
      expect(optionElements).toHaveLength(3)

      await user.type(input, " 1")
      optionElements = screen.queryAllByRole('option')
      expect(optionElements).toHaveLength(1)
      expect(optionElements[0].textContent).toBe('Option 1')

      await user.type(input, "11")
      optionElements = screen.queryAllByRole('option')
      expect(optionElements).toHaveLength(1)
      expect(optionElements[0].textContent).toBe('No data available')
    })

    test('shows selected option', async () => {
      const [option, optionElement] = getOption(randomIndex())

      await user.click(optionElement)

      const selectedOptionName = screen.getByTestId('display-content')
      const selectedOptionValue: HTMLInputElement = screen.getByTestId('selected-option-value')

      expect(selectedOptionName.textContent).toContain(option.name)
      expect(selectedOptionValue.value).toBe(option.value)
    })

    test('clicking a selected option un-selects it', async () => {
      const index = randomIndex()

      // Select the option
      const [_option, optionElement] = getOption(index)
      await user.click(optionElement)

      // Re-open the dropdown
      await user.click(selectElement)

      // Click on the already selected option
      const optionElementsNow: HTMLOptionElement[] = screen.getAllByRole('option')
      const [_selectedOption, selectedOptionElement] = getOption(index, options, optionElementsNow)
      await user.click(selectedOptionElement)

      const placeholder = screen.getByText('Test placeholder')
      const selectedOptionValue: HTMLInputElement = screen.getByTestId('selected-option-value')

      expect(placeholder).toBeDefined()
      expect(selectedOptionValue.value).toBe('')
    })

    test('selecting an option calls', async () => {
      const optionElements = screen.queryAllByRole('option')
      const randomOptionElement = optionElements[randomIndex()]

      await user.click(randomOptionElement)   // This collapses the dropdown

      const dropDown = screen.queryByRole('listbox')
      expect(dropDown).toBeNull()
    })

    test('selecting an option collapses the dropdown', async () => {
      const optionElements = screen.queryAllByRole('option')
      const randomOptionElement = optionElements[randomIndex()]

      await user.click(randomOptionElement)   // This collapses the dropdown

      const dropDown = screen.queryByRole('listbox')
      expect(dropDown).toBeNull()
    })

    test('selecting an option clears the search', async () => {
      const optionElements = screen.queryAllByRole('option')
      const randomOptionElement = optionElements[randomIndex()]
      const searchBox: HTMLInputElement = screen.getByRole('searchbox')

      await user.type(searchBox, 'option')
      await user.click(randomOptionElement)   // This collapses the dropdown
      await user.click(selectElement)         // Open the select again so its input is accessible

      const searchBoxNow: HTMLInputElement = screen.getByRole('searchbox')
      expect(searchBoxNow.value).toBe('')
    })

    test('without a selected option, clear selection button is not rendered', () => {
      const clear = screen.queryByLabelText('clear selected option')
      expect(clear).toBeNull()
    })

    test('with a selected option, clear selection button is rendered', async () => {
      const optionElements = screen.queryAllByRole('option')
      const randomOptionElement = optionElements[randomIndex()]
      await user.click(randomOptionElement)

      const clear = screen.queryByLabelText('clear selected option')
      expect(clear).not.toBeNull()
    })

    test('clicking "clear selection" button, clears the selected option', async () => {
      const randIndex = randomIndex()
      const optionElements = screen.queryAllByRole('option')
      const randomOptionElement = optionElements[randIndex]

      await user.click(randomOptionElement)

      const clear = screen.getByLabelText('clear selected option')
      const selectedOptionName = screen.getByTestId('display-content')
      const selectedOptionValue: HTMLInputElement = screen.getByTestId('selected-option-value')

      await user.click(clear)

      expect(selectedOptionName.textContent).toBe('Test placeholder')
      expect(selectedOptionValue.value).toBe('')
    })

    test('clicking "clear selection" button does not expand the dropdown', async () => {
      const randIndex = randomIndex()
      const optionElements = screen.queryAllByRole('option')
      const randomOptionElement = optionElements[randIndex]

      await user.click(randomOptionElement)

      const clear = screen.getByLabelText('clear selected option')
      await user.click(clear)

      const dropdown = screen.queryByRole('listbox')
      expect(dropdown).toBeNull()
    })

    test('losing focus collapses the dropdown', async () => {
      // Render an additional component, to focus
      const Input = (): JSX.Element => <input placeholder='testinput' type="text" />
      render(<Input />)

      const select = screen.getByRole('combobox')
      const input = screen.getByPlaceholderText('testinput')

      // Ensure it has focus. If it doesn't initially have focus, onBlur will never be invoked
      select.focus()

      const listBoxThen = screen.queryByRole('listbox')
      expect(listBoxThen).not.toBeNull()

      await user.click(input)

      const listBoxNow = screen.queryByRole('listbox')
      expect(listBoxNow).toBeNull()
    })

    test('losing focus to its own input does not collapse the dropdown', async () => {
      const select = screen.getByRole('combobox')
      const inputInsideSelect = screen.getByRole('searchbox')

      // Ensure it has focus. If it doesn't initially have focus, onBlur will never be invoked
      select.focus()

      const listBoxThen = screen.queryByRole('listbox')
      expect(listBoxThen).not.toBeNull()

      await user.click(inputInsideSelect)

      const listBoxNow = screen.queryByRole('listbox')
      expect(listBoxNow).not.toBeNull()
    })

    test('losing focus to any of its own options does not collapse the dropdown', async () => {
      const select = screen.getByRole('combobox')
      const options = screen.getAllByRole('option')
      const option = options[randomIndex()]

      // Ensure it has focus. If it doesn't initially have focus, onBlur will never be invoked
      select.focus()

      const listBoxBefore = screen.queryByRole('listbox')
      expect(listBoxBefore).not.toBeNull()

      fireEvent(option, new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      }))

      const listBoxOnMouseDown = screen.queryByRole('listbox')
      expect(listBoxOnMouseDown).not.toBeNull()
    })
  })

  describe('With expanded dropdown and tag creation enabled, no groups', () => {

    let onOptionCreated: Mock

    beforeEach(async () => {
      onOptionCreated = vi.fn()
      render(<Select options={ options } expanded={ true } tagCreation={ true } onOptionCreated={ onOptionCreated } />)
      selectElement = screen.getByRole('combobox')
      searchbox = screen.getByRole('searchbox')
    })

    test('searching for a non existing option displays "Create xxx"', async () => {
      const optionName = `Does not exist ${options[randomIndex()].name}`

      await user.type(searchbox, optionName)
      const optionElements = screen.getAllByRole('option')

      expect(optionElements).toHaveLength(1)
      expect(optionElements[0].textContent).toBe(`Create ${optionName}`)
    })

    test('clicking "Create xxx" creates and selects a new option', async () => {
      let optionElements: HTMLOptionElement[]

      const optionName = `Does not exist ${options[randomIndex()].name}`

      // Filter options
      await user.type(searchbox, optionName)
      optionElements = screen.getAllByRole('option')

      // Click on 'Create option xxx' (this collapses the dropdown)
      const tagCreationElement = optionElements[0]
      await user.click(tagCreationElement)

      const selectedOption = screen.getByTestId('display-content')
      expect(selectedOption.textContent).toBe(optionName)

      // Expand the dropdown again, to be able to access the options
      await user.click(selectElement)
      optionElements = screen.getAllByRole('option')

      const tagCreatedOption = optionElements.find(option =>
        option.textContent === optionName && option.value === dasherize(optionName)
      )
      expect(tagCreatedOption).not.toBeNull()
    })

    test('creating an option calls onOptionCreated if present', async () => {
      const optionName = `Does not exist ${options[randomIndex()].name}`

      // Filter options
      await user.type(searchbox, optionName)
      const optionElements = screen.getAllByRole('option')

      // Click on 'Create option xxx'
      const tagCreationElement = optionElements[0]
      await user.click(tagCreationElement)

      expect(onOptionCreated).toHaveBeenCalledTimes(1)
    })
  })

  describe('With initial value', () => {
    test('without options, initial value is ignored', () => {
      render(<Select options={[]} placeholder='Test placeholder' initialValue='option-3' />)
    })

    test('initial value is selected', () => {
      render(<Select options={ options } initialValue='option-3' />)

      const display = screen.getByTestId('display-content')
      const valueInput: HTMLInputElement = screen.getByTestId('selected-option-value')

      expect(display.textContent).toBe('Option 3')
      expect(valueInput.value).toBe('option-3')
    })

    test('multiple initial values are selected', () => {
      render(<Select options={ options } multiple={ true } initialValue={['option-1', 'option-3']} />)

      const selectedOptions = screen.getAllByTestId('chip')
      const selectedOptionValue: HTMLInputElement = screen.getByTestId('selected-option-value')

      expect(selectedOptions).toHaveLength(2)
      expect(selectedOptionValue.value).toBe(JSON.stringify(['option-1', 'option-3']))
    })
  })

  describe('With option groups', () => {
    beforeEach(async () => {
      render(<Select options={ groupedOptions } placeholder={ 'Test placeholder' } expanded={ true } tagCreation={ true }/>)
      selectElement = screen.getByRole('combobox')
      optionElements = screen.getAllByRole('option')
      searchbox = screen.getByRole('searchbox')
    })

    test('renders all options and their groups', () => {
      const optionElements: HTMLOptionElement[] = screen.getAllByRole('option')
      const groupElements: HTMLDivElement[] = [1, 2, 3].map(groupIndex => screen.getByLabelText(`Group ${groupIndex}`))

      expect(optionElements.length).toBe(10)
      expect(groupElements.length).toBe(3)

      optionElements.forEach((optionElement, index) =>
        expect(optionElement.textContent)
          .toBe(`Option ${index === optionElements.length - 1 ? 'last' : index + 1}`))
    })

    test('searching for a non existing option displays "Create xxx" in every group', async () => {
      const optionName = 'Does not exist'

      await user.type(searchbox, optionName)
      const optionElements = screen.getAllByRole('option')

      expect(optionElements).toHaveLength(3)
      optionElements.forEach(optionElement => expect(optionElement.textContent).toBe(`Create ${optionName}`))
    })
  })

  describe('With option separator', () => {
    beforeEach(async () => {
      render(<Select options={ options } expanded={ true } />)
      selectElement = screen.getByRole('combobox')
      optionElements = screen.getAllByRole('option')
      searchbox = screen.getByRole('searchbox')
    })

    // TODO continue here..
  })

  describe('Multiple select', () => {

    describe('With collapsed dropdown', () => {

      beforeEach(async () => {
        render(<Select options={ options } placeholder='Test placeholder' multiple={ true } />)
        selectElement = screen.getByRole('combobox')
      })

      test('placeholder is visible', () => {
        const display = screen.getByTestId('display-content')
        expect(display.textContent).toBe('Test placeholder')
      })

      test('without selected options, the clear selection button is not rendered', () => {
        const clear = screen.queryByLabelText('clear selected option')
        expect(clear).toBeNull()
      })
    })

    describe('With expanded dropdown', () => {

      beforeEach(async () => {
        render(<Select options={ options } placeholder='Test placeholder' multiple={ true } expanded={ true } />)
        selectElement = screen.getByRole('combobox')
        optionElements = screen.queryAllByRole('option')
        listbox = screen.getByRole('listbox')
      })

      test('listbox element aria multiselect is true', () => {
        expect(listbox.ariaMultiSelectable).toBe('true')
      })

      test('with selected options, the clear selection button is rendered', async () => {
        const [_option, optionElement] = getOption(randomIndex())
        await user.click(optionElement)

        const clear = screen.queryByLabelText('clear selected option')
        expect(clear).not.toBeNull()
      })

      test('selecting an option does not collapse the dropdown', async () => {
        const [_option, optionElement] = getOption(randomIndex())
        await user.click(optionElement)

        const dropDown = screen.queryByRole('listbox')
        expect(dropDown).not.toBeNull()
      })

      test('clicking on an option adds it to the selection', async () => {
        const [option1, optionElement1] = getOption(0)
        const [option2, optionElement2] = getOption(1)

        await user.click(optionElement1)
        await user.click(optionElement2)

        const selectedOptions = screen.getAllByTestId('chip')
        const selectedOptionValue: HTMLInputElement = screen.getByTestId('selected-option-value')

        expect(selectedOptions).toHaveLength(2)
        expect(selectedOptionValue.value).toBe(JSON.stringify([option1.value, option2.value]))
      })

      test('selected options have aria selected', async () => {
        const [_option1, optionElement1] = getOption(0)
        const [_option2, optionElement2] = getOption(1)

        await user.click(optionElement1)
        await user.click(optionElement2)

        const optionElementsNow = screen.queryAllByRole('option')
        const selectedElement1 = optionElementsNow[0]
        const selectedElement2 = optionElementsNow[1]

        expect(selectedElement1.ariaSelected).toBe('true')
        expect(selectedElement2.ariaSelected).toBe('true')
      })

      test('clicking a selected option remove button removes it from the selection', async () => {
        const [_option1, optionElement1] = getOption(0)
        const [option2, optionElement2] = getOption(1)

        await user.click(optionElement1)
        await user.click(optionElement2)

        const removeOption1 = screen.getAllByLabelText('remove this option')[0]
        await user.click(removeOption1)

        const selectedOptions = screen.getAllByTestId('chip')
        const selectedOptionValue: HTMLInputElement = screen.getByTestId('selected-option-value')

        expect(selectedOptions).toHaveLength(1)
        expect(selectedOptionValue.value).toBe(JSON.stringify([option2.value]))
      })

      test('removing all options shows the placeholder', async () => {
        const [_option1, optionElement1] = getGroupedOption(0)
        const [_option2, optionElement2] = getGroupedOption(1)

        await user.click(optionElement1)
        await user.click(optionElement2)

        const removeOption1 = screen.getAllByLabelText('remove this option')[0]
        const removeOption2 = screen.getAllByLabelText('remove this option')[1]

        await user.click(removeOption1)
        await user.click(removeOption2)

        const placeholder = screen.getByText('Test placeholder')
        expect(placeholder).toBeDefined()
      })

      test('given a collapsed dropdown, removing an option does not expand the dropdown', async () => {
        const Input = (): JSX.Element => <input placeholder='testinput' type="text" />
        render(<Input />)

        // Select option
        const [_option, optionElement] = getGroupedOption(0)
        await user.click(optionElement)

        // Remove select focus (collapse the dropdown)
        const input = screen.getByPlaceholderText('testinput')
        await user.click(input)

        // Remove option
        const removeOption1 = screen.getAllByLabelText('remove this option')[0]
        await user.click(removeOption1)

        const dropdown = screen.queryByRole('listbox')
        expect(dropdown).toBeNull()
      })

      test('given a expanded dropdown, removing an option does not collapse the dropdown', async () => {
        const [_option, optionElement] = getGroupedOption(0)
        await user.click(optionElement)

        // Remove option
        const removeOption1 = screen.getAllByLabelText('remove this option')[0]
        await user.click(removeOption1)

        const dropdown = screen.queryByRole('listbox')
        expect(dropdown).not.toBeNull()
      })

      test('clicking a selected option un-selects it', async () => {
        const [_option, optionElement] = getOption(randomIndex())

        await user.click(optionElement)
        await user.click(optionElement)

        const placeholder = screen.getByText('Test placeholder')
        const selectedOptionValue: HTMLInputElement = screen.getByTestId('selected-option-value')

        expect(placeholder).toBeDefined()
        expect(selectedOptionValue.value).toBe('')
      })
    })
  })

  describe('Keyboard navigation and Focus', () => {
    beforeEach(async () => {
      render(<Select options={ options } placeholder='Test placeholder' expanded={ true } />)
      selectElement = screen.getByRole('combobox')
      listbox = screen.getByRole('listbox')
      optionElements = screen.queryAllByRole('option')
    })

    test('first option is selected by default', async () => {
      const [firstOption, firstOptionElement] = getOption(0)

      expect(selectElement.getAttribute('aria-activedescendant')).toBe(`select__option-${firstOption.value}`)
      expect(firstOptionElement.className.includes('optionFocused')).toBe(true)
    })

    test('"arrow down" focuses the next option', async () => {
      fireEvent.keyDown(selectElement, { key: 'ArrowDown', code: 'ArrowDown', charCode: 38 })
      expect(selectElement.getAttribute('aria-activedescendant')).toBe(`select__option-${options[1].value}`)

      fireEvent.keyDown(selectElement, { key: 'ArrowDown' })
      expect(selectElement.getAttribute('aria-activedescendant')).toBe(`select__option-${options[2].value}`)

      // Last option is selected, expect arrow down to focus the same option
      fireEvent.keyDown(selectElement, { key: 'ArrowDown' })
      expect(selectElement.getAttribute('aria-activedescendant')).toBe(`select__option-${options[2].value}`)
    })

    test('"arrow up" focuses the previous option', () => {
      // Move focus to the last option
      for (let i = 0; i < 2; i++)
        fireEvent.keyDown(selectElement, { key: 'ArrowDown' })

      fireEvent.keyDown(selectElement, { key: 'ArrowUp' })
      expect(selectElement.getAttribute('aria-activedescendant')).toBe(`select__option-${options[1].value}`)

      fireEvent.keyDown(selectElement, { key: 'ArrowUp' })
      expect(selectElement.getAttribute('aria-activedescendant')).toBe(`select__option-${options[0].value}`)

      // First option is selected, expect arrow down to focus the same option
      fireEvent.keyDown(selectElement, { key: 'ArrowUp' })
      expect(selectElement.getAttribute('aria-activedescendant')).toBe(`select__option-${options[0].value}`)
    })

    test('"enter" selects the currently focused option', () => {
      // Move focus to the last option
      for (let i = 0; i < 3; i++)
        fireEvent.keyDown(selectElement, { key: 'ArrowDown' })

      fireEvent.keyDown(selectElement, { key: 'Enter' })

      const selectedOptionName = screen.getByTestId('display-content')
      const selectedOptionValue: HTMLInputElement = screen.getByTestId('selected-option-value')
      const listbox = screen.queryByRole('listbox')

      const [option] = getOption(2)

      expect(listbox).toBeNull()
      expect(selectedOptionName.textContent).toContain(option.name)
      expect(selectedOptionValue.value).toBe(option.value)
    })

    test('"esc" collapses the dropdown', () => {
      fireEvent.keyDown(selectElement, { key: 'Escape' });

      const listbox = screen.queryByRole('listbox')
      expect(listbox).toBeNull()
    })

    test('filtering options sets first option as focused', async () => {
      const input: HTMLInputElement = screen.getByRole('searchbox')

      fireEvent.keyDown(selectElement, { key: 'ArrowDown', code: 'ArrowDown', charCode: 38 })
      expect(selectElement.getAttribute('aria-activedescendant')).toBe(`select__option-${options[1].value}`)

      await user.type(input, "option")
      expect(selectElement.getAttribute('aria-activedescendant')).toBe(`select__option-${options[0].value}`)
    })

    test('hovering over an option gives it "visual focus"', async () => {
      // First option selected by default
      const [_firstOptionNow, firstOptionElement] = getOption(0)
      expect(selectElement.getAttribute('aria-activedescendant')).toBe(`select__option-${options[0].value}`)

      const indexAfterFirst = Math.max(1, randomIndex())
      const [_option, optionElement] = getOption(indexAfterFirst)

      fireEvent.mouseEnter(optionElement)
      const [_optionNow, optionElementNow] = getOption(indexAfterFirst)

      // first option no longer 'focused'
      expect(firstOptionElement.className.includes('optionFocused')).toBe(false)

      expect(optionElementNow.className.includes('optionFocused')).toBe(true)
      expect(selectElement.getAttribute('aria-activedescendant')).toBe(`select__option-${options[indexAfterFirst].value}`)
    })
  })

  describe('Accessibility', () => {

    describe('With collapsed dropdown', () => {
      beforeEach(async () => {
        render(<Select options={ options } placeholder='Test placeholder' />)
        selectElement = screen.getByRole('combobox')
      })

      test('select element has expanded false by default', () => {
        expect(selectElement.ariaExpanded).toBe('false')
      })
    })

    describe('With expanded dropdown', () => {
      beforeEach(async () => {
        render(<Select options={ options } placeholder='Test placeholder' expanded={ true } />)
        selectElement = screen.getByRole('combobox')
        listbox = screen.getByRole('listbox')
        optionElements = screen.queryAllByRole('option')
      })

      test('select element has accessibility properties', async () => {
        expect(selectElement.tabIndex).toBe(0)
        expect(selectElement.role).toBe('combobox')
        expect(selectElement.ariaExpanded).toBe('true')
        expect(selectElement.ariaHasPopup).toBe('listbox')
        expect(selectElement.hasAttribute('aria-owns')).toBe(true)
        expect(selectElement.hasAttribute('aria-controls')).toBe(true)

        const valueDisplay = within(selectElement).getByTestId('display-content')
        expect(valueDisplay.ariaLive).toBe('polite')

        // Choose an option so clear button is rendered
        await user.click(getOption(randomIndex())[1])

        const clearButton = screen.getByLabelText('clear selected option')
        expect(clearButton.role).toBe('button')
      })

      test('dropdown search element has accessibility properties', () => {
        const search = within(listbox.parentElement as HTMLElement).getByRole('searchbox')

        // @ts-ignore
        expect(search.type).toBe('search')
        expect(search.ariaLabel).toBe('search options')
        expect(search.tabIndex).toBe(0)
        expect(search.getAttribute('aria-controls')).toBe('select__options')
      })

      test('dropdown listbox element have accessibility properties', () => {
        expect(listbox.role).toBe('listbox')
        expect(listbox.ariaLive).toBe('polite')
        expect(listbox.ariaMultiSelectable).toBe('false')
      })
    })
  })
})
