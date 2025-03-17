import { render, screen } from '@testing-library/react'
import Select, { Option } from './Select.tsx'
import { userEvent, UserEvent } from '@testing-library/user-event'


describe('Select', () => {

  const options: Option[] = [
    { name: "Option 1", value: "option-1" },
    { name: "Option 2", value: "option-2" },
    { name: "Option 3", value: "option-3" }
  ]

  let selectElement: HTMLElement

  describe('With no options', () => {
    test('Without options, renders empty message', () => {
      render(<Select options={[]} isExpanded={ true }/>)

      const optionElements = screen.getAllByRole('option')

      expect(optionElements.length).toBe(1)
      expect(optionElements[0].textContent).toBe('No data available')
    })
  })

  describe('with no expanded select', () => {
    beforeEach(async () => {
      render(<Select options={ options } isExpanded={ false }/>)
      selectElement = screen.getByRole('combobox')
    })

    test('dropdown list is not rendered by default', () => {
      const dropdown = screen.queryByRole('listbox')

      expect(dropdown).toBeNull()
      expect(selectElement.ariaExpanded).toBe('false')
    })

    test('clicking on the select component shows the dropdown list', async () => {
      const user = userEvent.setup()
      await user.click(selectElement)

      const dropdown = screen.queryByRole('listbox')
      expect(dropdown).not.toBeNull()
      expect(selectElement.ariaExpanded).toBe('true')
    })
  })

  describe('With expanded select', () => {

    let user: UserEvent

    beforeEach(async () => {
      render(<Select options={ options } isExpanded={ true }/>)
      selectElement = screen.getByRole('combobox')
      user = userEvent.setup()
    })

    test('With options, renders options', () => {
      const optionElements: HTMLOptionElement[] = screen.getAllByRole('option')
      expect(optionElements.length).toBe(3)

      optionElements.forEach((option, index) => {
        expect(option.textContent).toBe(`${options[index].name}`)
        expect(option.dataset.value).toBe(`${options[index].value}`)
      })
    })

    test('Renders search input', () => {
      const input: HTMLInputElement = screen.getByRole('searchbox')
      expect(input.type).toBe('search')
    })

    test('filters options by search', async () => {
      let optionElements: HTMLOptionElement[]

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
      const randIndex = randomNumber(options.length)
      const optionElements = screen.queryAllByRole('option')

      const randomOption = options[randIndex]
      const randomOptionElement = optionElements[randIndex]

      await user.click(randomOptionElement)

      const selectedOptionName = screen.getByTestId('selected-option-name')
      const selectedOptionValue: HTMLInputElement = screen.getByTestId('selected-option-value')

      expect(selectedOptionName.textContent).toContain(randomOption.name)
      expect(selectedOptionValue.value).toBe(randomOption.value)
    })

    test('selecting an option clears the search', async () => {
      const optionElements = screen.queryAllByRole('option')
      const randomOptionElement = optionElements[randomNumber(options.length)]
      const searchBox: HTMLInputElement = screen.getByRole('searchbox')

      await user.type(searchBox, 'option')
      await user.click(randomOptionElement)

      expect(searchBox.value).toBe('')
    })

    test('Without a selected option, clear selection button is not rendered', () => {
      const clear = screen.queryByLabelText('clear selected option')
      expect(clear).toBeNull()
    })

    test('With a selected option, clear selection button is rendered', async () => {
      const optionElements = screen.queryAllByRole('option')
      const randomOptionElement = optionElements[randomNumber(options.length)]
      await user.click(randomOptionElement)

      const clear = screen.queryByLabelText('clear selected option')
      expect(clear).not.toBeNull()
    })

    test('clicking clear selection button, clears the selected option', async () => {
      const randIndex = randomNumber(options.length)
      const optionElements = screen.queryAllByRole('option')
      const randomOptionElement = optionElements[randIndex]

      await user.click(randomOptionElement)

      const clear = screen.getByLabelText('clear selected option')
      const selectedOptionName = screen.getByTestId('selected-option-name')
      const selectedOptionValue: HTMLInputElement = screen.getByTestId('selected-option-value')

      await user.click(clear)

      expect(selectedOptionName.textContent).toBe('')
      expect(selectedOptionValue.value).toBe('')
    })
  })
})

const randomNumber = (max: number): number => Math.floor(Math.random() * max)
