import { render, screen, within } from '@testing-library/react'
import Option from './Option.tsx'

describe('Option', () => {

  const option = { name: "Option 1", value: "option-1" }
  let optionElement: HTMLOptionElement

  describe('Default state', () => {

    beforeEach(() => {
      render(<Option option={ option } />)
      optionElement = screen.getByRole('option')
    })

    test('has role option', () => {
      expect(optionElement.role).toBe('option')
    })

    test('has tab index (is focusable)', () => {
      expect(optionElement.tabIndex).toBe(0)
    })

    test('has aria selected false', async () => {
      expect(optionElement.ariaSelected).toBe('false')
    })

    test('option does not have optionFocused class', () => {
      expect(optionElement.className.includes('optionFocused')).toBe(false)
    })

    test('does not have selected icon', async () => {
      const selectedMark = within(optionElement).queryByTestId('selected-mark')
      expect(selectedMark).toBeNull()
    })
  })

  describe('Selected', () => {

    beforeEach(() => {
      render(<Option option={ option } selected={ true } />)
      optionElement = screen.getByRole('option')
    })

    test('has aria selected true', async () => {
      expect(optionElement.ariaSelected).toBe('true')
    })

    test('has selected icon', async () => {
      const selectedMark = within(optionElement).getByTestId('selected-mark')
      expect(selectedMark).toBeDefined()
    })
  })

  describe('Focused', () => {

    // This is a 'visual' focus. It will not take focus from other views
    // This is so options can be visibly 'focused' without taking focus form, for example, the select searchbox

    beforeEach(() => {
      render(<Option option={ option } focused={ true } />)
      optionElement = screen.getByRole('option')
    })

    test('focused option has optionFocused class', () => {
      expect(optionElement.className.includes('optionFocused')).toBe(true)
    })
  })

})

