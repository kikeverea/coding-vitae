import { render, screen } from '@testing-library/react'
import Select, { Option } from './Select.tsx'
import userEvent from '@testing-library/user-event'


describe('Select', () => {

  let options: Option[]

  beforeEach(() => {
    options = options = [
      { name: "Option 1", value: "option-1" },
      { name: "Option 2", value: "option-2" },
      { name: "Option 3", value: "option-3" }
    ]
  })

  test('Without options, renders an empty select', () => {
    render(<Select options={[]}/>)

    const optionElements = screen.getAllByRole('option')

    expect(optionElements.length).toBe(1)
    expect(optionElements[0].textContent).toBe('No data available')
  })

  test('With options, renders options', () => {

    render(<Select options={ options }/>)

    const optionElements: HTMLOptionElement[] = screen.getAllByRole('option')
    expect(optionElements.length).toBe(3)

    optionElements.forEach((option, index) => {
      expect(option.textContent).toBe(`${options[index].name}`)
      expect(option.value).toBe(`${options[index].value}`)
    })
  })

  test('With options, renders search input', () => {
    render(<Select options={ options }/>)

    const input: HTMLInputElement = screen.getByRole('searchbox')
    expect(input.type).toBe('search')
  })

  test('filters options by search', () => {
    const user = userEvent.setup()
    let optionElements: HTMLOptionElement[]

    render(<Select options={ options }/>)

    const input: HTMLInputElement = screen.getByRole('searchbox')

    user.type(input, "option")
    optionElements = screen.queryAllByRole('option')
    expect(optionElements).toHaveLength(3)

    user.type(input, "1")
    optionElements = screen.queryAllByRole('option')
    expect(optionElements).toHaveLength(1)

    // user.type(input, "11")
    // optionElements = screen.queryAllByRole('option')
    // expect(optionElements).toHaveLength(0)
  })
})