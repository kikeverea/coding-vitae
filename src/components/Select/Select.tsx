import {MouseEvent, useState} from 'react'

export type Option = {
  name: string
  value: string
}

type SelectProps = {
  options: Option[],
  isExpanded?: boolean
}

/*
 Mouse Up/Down support -> aria-activedescendant
*/

const Select = ({ options, isExpanded } : SelectProps) => {
  const [ search, setSearch ] = useState('')
  const [ selectedOption, setSelectedOption ] = useState<Option | null>(null)
  const [ expanded, setExpanded ] = useState(isExpanded)

  const selectOption = (e: MouseEvent<HTMLDivElement>) => {
    const option = e.currentTarget
    setSelectedOption({ name: option.textContent || '', value: option.dataset.value || '' })
    setSearch('')
  }

  const filterOptions = (e: MouseEvent<HTMLInputElement> ) => {
    const input = e.currentTarget
    setSearch(input.value)
  }

  const expand = () => {
    if (!expanded)
      setExpanded(true)
  }

  const clearSelectedOption = () => setSelectedOption(null)

  const filteredOptions = options.filter(
    option => option.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div
      role='combobox'
      aria-haspopup='listbox'
      aria-owns="dropdown-list"
      aria-controls="dropdown-list"
      aria-expanded={ expanded }
      style={{ border: '1px solid white', minWidth: '250px', minHeight: '30px'}}
      onClick={ expand }
      tabIndex={ 0 }
    >
      { /* Selected Option */ }
      <div id='selected-option' data-testid='selected-option-name' aria-live='polite'>
        { selectedOption?.name }
        { selectedOption &&
          <span style={{fontSize: '12px'}} onClick={clearSelectedOption} role='button' aria-label='clear selected option'>
            Clear
          </span>
        }
      </div>
      <input type="hidden" value={ selectedOption?.value || '' } data-testid='selected-option-value' />

      { /* Dropdown */ }
      { expanded &&
        <div id='dropdown-list' role='listbox'>

          <input type="search" onInput={ filterOptions } tabIndex={ 0 } value={ search }></input>

          { filteredOptions.length > 0
            ? filteredOptions.map(option =>
              <div
                key={ option.value }
                role='option'
                data-value={ option.value }
                onClick={ selectOption }
                tabIndex={ 0 }
              >
                { option.name }
              </div>
            )
            : <div role='option'>{ 'No data available' }</div>
          }
        </div>
      }
    </div>
  )
}

export default Select