import { render, screen } from '@testing-library/react'
import { userEvent, UserEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import Chip from './Chip.tsx'


describe('Chip', () => {

  const icon = <i className="fa-solid fa-circle-user" data-testid='test-icon'></i>
  const svg = <svg data-testid='test-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M399 384.2C376.9 345.8 335.4 320 288 320l-64 0c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z"/></svg>

  test('renders text', () => {
    render(<Chip label='Chip test'/>)

    const text = screen.getByText('Chip test')
    expect(text).toBeDefined()
  })

  test('renders icon', () => {
    render(<Chip label='Chip test' icon={ icon }/>)

    const renderedIcon = screen.getByTestId('test-icon')
    expect(renderedIcon).toBeDefined()
  })

  test('renders svg', () => {
    render(<Chip label='Chip test' icon={ svg }/>)

    const renderedIcon = screen.getByTestId('test-icon')
    expect(renderedIcon).toBeDefined()
  })

  test('renders icon component', () => {
    const Icon = () => <i className="fa-solid fa-circle-user" data-testid='test-icon'></i>
    render(<Chip label='Chip test' icon={ <Icon /> } />)

    const renderedIcon = screen.getByTestId('test-icon')
    expect(renderedIcon).toBeDefined()
  })

  test('cant be both selectable and removable', () => {
    expect(() => render(<Chip label='Chip test' selectable={ true } removable={ true }/>)).toThrow()
  })

  describe('Selectable', () => {
    let user: UserEvent

    beforeEach(() => {
      user = userEvent.setup()
    })

    test('if not selectable, clicking chip does not display selected icon', async () => {
      const selectedIcon = <i className="fa-solid fa-circle-user" data-testid='test-icon'></i>
      render(<Chip label='Chip test' selectedIcon={ selectedIcon } />)

      const chip = screen.getByTestId('chip')
      await user.click(chip)

      const renderedIcon = screen.queryByTestId('test-icon')
      expect(renderedIcon).toBeNull()
    })

    test('if selectable, role is button', async () => {
      render(<Chip label='Chip test' selectable={ true }/>)

      const chip = screen.getByTestId('chip')
      expect(chip.role).toBe('button')
    })

    test('if not selected, do not render selected icon', () => {
      const selectedIcon = <i className="fa-solid fa-circle-user" data-testid='test-icon'></i>
      render(<Chip label='Chip test' selectable={ true } selectedIcon={ selectedIcon } />)

      const renderedIcon = screen.queryByTestId('test-icon')
      expect(renderedIcon).toBeNull()
    })

    test('if selected, call on selected', async () => {
      const onSelected = vi.fn()

      render(<Chip label='Chip test' selectable={ true } onSelected={ onSelected } />)

      const chip = screen.getByTestId('chip')
      await user.click(chip)

      expect(onSelected).toHaveBeenCalledTimes(1)
    })

    test('if selected, render selected icon', async () => {
      const selectedIcon = <i className="fa-solid fa-circle-user test-icon" data-testid='my-test-icon'></i>
      render(<Chip label='Chip test' selectable={ true } selectedIcon={ selectedIcon } />)

      const chip = screen.getByTestId('chip')
      await user.click(chip)

      const renderedIcon = screen.queryByTestId('my-test-icon')
      expect(renderedIcon).toBeDefined()
      expect(renderedIcon?.classList.contains('test-icon')).toBe(true)
    })

    test('if selected and no "selected icon" is given, render the default selected icon', async () => {
      render(<Chip label='Chip test' selectable={ true } />)

      const chip = screen.getByTestId('chip')
      await user.click(chip)

      const renderedIcon = screen.queryByTestId('test-icon')
      expect(renderedIcon).toBeDefined()
    })

    test('if selected aria selected is true', async () => {
      render(<Chip label='Chip test' selectable={ true } />)

      const chip = screen.getByTestId('chip')
      await user.click(chip)

      expect(chip.ariaSelected).toBe('true')
    })

    test('toggles chip when clicked', async () => {
      render(<Chip label='Chip test' selectable={ true } />)

      const chip = screen.getByTestId('chip')
      await user.click(chip)

      const renderedIcon = screen.queryByTestId('test-icon')
      expect(renderedIcon).toBeDefined()

      await user.click(chip)

      const notRenderedIcon = screen.queryByTestId('test-icon')
      expect(notRenderedIcon).toBeNull()
    })

    test('if initially selected, render as selected', async () => {
      render(<Chip label='Chip test' selectable={ true } selected={ true } />)

      const chip = screen.getByTestId('chip')
      const renderedIcon = screen.getByTestId('selected-icon')

      expect(renderedIcon).toBeDefined()
      expect(chip.ariaSelected).toBe('true')
    })

    // Follows Font Awesome recommendations on accessibility
    test('default selected icon has role img and aria hidden true', async () => {
      render(<Chip label='Chip test' selectable={ true } selected={ true } />)

      const renderedIcon = screen.getByTestId('selected-icon')

      expect(renderedIcon.role).toBe('img')
      expect(renderedIcon.ariaHidden).toBe('true')
    })
  })

  describe('Removable', () => {
    let user: UserEvent

    beforeEach(() => {
      user = userEvent.setup()
    })

    test('if removable, renders remove icon', () => {
      const removeIcon = <i className="fa-solid fa-circle-user" data-testid='test-icon'></i>
      render(<Chip label='Chip test' removable={ true } removeIcon={ removeIcon } />)

      const renderedIcon = screen.queryByTestId('test-icon')
      expect(renderedIcon).toBeDefined()
    })

    test('if removable and no "remove icon" is given, renders default remove icon', () => {
      render(<Chip label='Chip test' removable={ true } />)

      const renderedIcon = screen.getByRole('button')

      expect(renderedIcon).toBeDefined()
      expect(renderedIcon.ariaLabel).toBe('remove this option')
    })

    test('removable icon has role button and aria label', () => {
      render(<Chip label='Chip test' removable={ true } />)
    })

    test('on remove icon mouse down, call goingToRemove prop', async () => {
      const goingToRemove = vi.fn()
      render(<Chip label='Chip test' removable={ true } beforeRemove={ goingToRemove } />)

      const removeButton = screen.getByRole('button')
      await user.click(removeButton)

      expect(goingToRemove).toHaveBeenCalledTimes(1)
    })

    test('if remove icon is clicked, call onRemove prop', async () => {
      const onRemove = vi.fn()
      render(<Chip label='Chip test' removable={ true } onRemove={ onRemove } />)

      const removeButton = screen.getByRole('button')
      await user.click(removeButton)

      expect(onRemove).toHaveBeenCalledTimes(1)
    })

    // Follows Font Awesome recommendations on accessibility
    test('default remove icon has role img and aria hidden true', async () => {
      render(<Chip label='Chip test' removable={ true } />)

      const renderedIcon = screen.getByTestId('remove-icon')

      expect(renderedIcon.role).toBe('img')
      expect(renderedIcon.ariaHidden).toBe('true')
    })
  })

  describe('Style', () => {
    test('renders icon with the given "color"', () => {
      const icon = <i className="fa-solid fa-calendar-days" data-testid="test-icon"></i>
      render(<Chip label='Chip test' color='#FFF' icon={ icon } iconColor='#FFF'/>)

      const chipIcon = screen.getByTestId('test-icon')

      expect(chipIcon.parentElement?.style.color).toBe('rgb(255, 255, 255)')
    })

    test('renders with a border of a given "color"', () => {
      render(<Chip label='Chip test' color='#FFF' />)

      const chip = screen.getByTestId('chip')

      expect(chip.style.borderColor).toBe('rgb(255, 255, 255)')
    })

    test('renders with a border of a given "border color"', () => {
      render(<Chip label='Chip test' borderColor='#FFF' />)

      const chip = screen.getByTestId('chip')

      expect(chip.style.borderColor).toBe('rgb(255, 255, 255)')
    })

    test('if type solid, renders with a background and a border of a given "color"', () => {
      render(<Chip label='Chip test' color='#1735EA' chipStyle='solid' />)

      const chip = screen.getByTestId('chip')

      expect(chip.style.borderColor).toBe('rgb(23, 53, 234)')
      expect(chip.style.backgroundColor).toBe('rgb(23, 53, 234)')
    })

    test('if type solid, renders with a background of a given "color", and a border of a given "border color"', () => {
      render(<Chip label='Chip test' chipStyle='solid' borderColor="#EA1717" color='#1735EA' />)

      const chip = screen.getByTestId('chip')

      expect(chip.style.borderColor).toBe('rgb(234, 23, 23)')
      expect(chip.style.backgroundColor).toBe('rgb(23, 53, 234)')
    })

    test('has cursor pointer if selectable"', () => {
      render(<Chip label='Chip test' selectable={ true } />)

      const chip = screen.getByTestId('chip')

      expect(chip.style.cursor).toBe('pointer')
    })
  })
})
