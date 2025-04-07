import {FC, MouseEvent, KeyboardEvent, useRef, useState, useEffect, ReactNode} from 'react'
import Chip from '../Chip/Chip.tsx'
import styles from './Select.module.css'
import Option, { OptionType } from './Option'

type SelectProps = {
  options: OptionType[],
  name?: string,
  initialValue?: string | string[],
  expanded?: boolean,
  tagCreation?: boolean | ((name: string) => Promise<OptionType>),
  placeholder?: string,
  noDataMessage?: string,
  multiple?: boolean,
}

const tagCreationPrompt = (optionName: string): string => `Create ${optionName}`
const clearButtonIcon = <svg className={ styles.buttonIcon } role='img' aria-hidden='true' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
const expandButtonIcon = <svg className={ `${styles.buttonIcon} ${styles.dropdownIcon}` } role='img' aria-hidden='true' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
const collapseButtonIcon = <svg className={ `${styles.buttonIcon} ${styles.dropdownIcon}` } role='img' aria-hidden='true' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"/></svg>

const Select: FC<SelectProps> = ({
  name,
  initialValue,
  options,
  placeholder='',
  expanded: isExpanded=false,
  tagCreation=false,
  multiple=false,
  noDataMessage='No data available'
}) => {

  const isMultiple = (_selection: any): _selection is OptionType[] => multiple

  const [ search, setSearch ] = useState('')
  const [ expanded, setExpanded ] = useState(isExpanded)
  const [ focusedOptionIndex, setFocusedOptionIndex ] = useState(0)
  const [ selection, setSelection ] = useState<OptionType | OptionType[] | null>(
    () => initialValue
      ? multiple
        ? options.filter(option => initialValue.includes(option.value)) || null
        : options.find(option => initialValue === option.value) || null
      : null
  )

  const createdOptions = useRef<OptionType[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIgnoreBlurEvent()
    inputRef.current?.focus()
  }, [expanded])

  let ignoreBlurEvent = false

  // Optimize querying for selected options. Prevent O(nm) on large option sets
  const selectionSet: Set<string> =
    selection
      ? new Set(isMultiple(selection)
          ? selection.map(option => option.value)
          : [selection?.value]
        )
      : new Set()

  const handleOptionClicked = (e: MouseEvent, option: OptionType) => {
    const isSelected = selectionSet.has(option.value)

    if (isSelected)
      unselectOption(e, option)
    else
      selectOption(option)
  }

  const handleOptionHover =  (_e: MouseEvent, option: OptionType) => {
    const index = filteredOptions.findIndex(
      filteredOption => filteredOption.value === option.value)

    setFocusedOptionIndex(index)
  }

  const selectOption = (selectedOption: OptionType) => {
    const isTagCreation = selectedOption.name == tagCreationPrompt(search)

    const option = {
      name: isTagCreation ? search : selectedOption.name || '',
      value: selectedOption.value || ''
    }

    const index = filteredOptions.findIndex(
      filteredOption => filteredOption.value === option.value)

    if (isMultiple(selection))
      setSelection([ ...(selection || []), option ])
    else
      setSelection(option)

    setSearch('')
    setExpanded(multiple)
    setFocusedOptionIndex(index)
    isTagCreation && createdOptions.current.push(option)
  }

  const unselectOption = (e: MouseEvent, selectedOption: OptionType) => {
    if (isMultiple(selection))
      removeOption(e, selectedOption)
    else
      setSelection(null)
  }

  const removeOption = (e: MouseEvent, option: OptionType) => {
    e.stopPropagation()

    const multipleSelection = selection as OptionType[] // to be here, selection has already been type-guarded, casting is safe
    const newSelection = multipleSelection.filter(selectionOption => selectionOption.value !== option.value)

    setSelection(newSelection.length > 0 ? newSelection : null)
  }

  const handleKeyNavigation = (e: KeyboardEvent<HTMLDivElement>, options: OptionType[]) => {
    switch (e.key) {
      case 'ArrowDown':
        // Move focus down (next option)
        setFocusedOptionIndex((prevIndex) => Math.min(prevIndex + 1, options.length - 1));
        break
      case 'ArrowUp':
        // Move focus up (previous option)
        setFocusedOptionIndex((prevIndex) => Math.max(prevIndex - 1, 0))
        break
      case 'Enter':
        if (focusedOptionIndex >= 0 && focusedOptionIndex < options.length) {
          selectOption(options[focusedOptionIndex])
          setExpanded(false)  // Close the dropdown after selection
        }
        break
      case 'Escape':
        setSearch('')
        setExpanded(false)  // Close the dropdown on Escape
        break
      default:
        break
    }
  }

  const filterOptions = (e: MouseEvent<HTMLInputElement> ) => {
    const input = e.currentTarget
    setSearch(input.value)
    setFocusedOptionIndex(0)
  }

  const toggleDropdown = (e: MouseEvent) => {
    const eventOrigin = e.target

    if (!(eventOrigin instanceof HTMLElement))
      return

    const eventOriginatedBySelect =
      eventOrigin.role === 'combobox' ||
      eventOrigin.id === 'select__display' ||
      eventOrigin.id === 'select__value' ||
      eventOrigin.id === 'select__dropdown-btn'

    if (eventOriginatedBySelect)
      setExpanded(!expanded)
  }

  const setIgnoreBlurEvent = () => {
    // At this moment, mouse is pressed-down inside Select
    // Ignore blur event as the desired behaviour is to collapse the dropdown
    // when Select loses focus to nodes outside its boundaries
    ignoreBlurEvent = true
  }

  const considerCollapsing = () => {

    if (ignoreBlurEvent) {
      ignoreBlurEvent = false    // consume the ignore blur event
      return
    }
    setExpanded(false)
  }

  const clearSelection = (e: MouseEvent) => {
    e.stopPropagation()
    setSelection(null)
  }

  const filteredOptions = [...options, ...createdOptions.current].filter(
    option => option.name.toLowerCase().includes(search.toLowerCase()))

  if (filteredOptions.length === 0 && tagCreation)
    filteredOptions.push({ name: tagCreationPrompt(search), value: search.toLowerCase().replace(/\s/g, '-') })

  return (
    <div
      role='combobox'
      className={ styles.select }
      aria-haspopup='listbox'
      aria-owns="select__dropdown-list"
      aria-controls="select__dropdown-list"
      aria-activedescendant={ options.length > 0 ? `select__option-${options[focusedOptionIndex].value}` : '' }
      aria-expanded={ expanded }
      onClick={ toggleDropdown }
      onMouseDown={ setIgnoreBlurEvent }
      onBlur={ considerCollapsing }
      onKeyDown={ e => handleKeyNavigation(e, filteredOptions) }
      tabIndex={ 0 }
    >

      { /* Display */ }
      <div id='select__display' className={ styles.display }>
        <div id='select__value' className={ styles.displayValue } aria-live='polite' data-testid='display-content'>
          { selection
            ? isMultiple(selection)
              ? <>
                { selection.map((option: OptionType) =>
                  <Chip
                    key={ option.value }
                    label={ option.name }
                    removable={ true }
                    beforeRemove={ setIgnoreBlurEvent }
                    onRemove={ e => removeOption(e, option) }
                  />)}
                </>
              : selection.name
            : placeholder
          }
        </div>
        { selection &&
          <span
            className={ styles.clearButton }
            role='button'
            onClick={ clearSelection }
            aria-label='clear selected option'
          >
            { clearButtonIcon }
          </span>
        }
        <span
          id='select__dropdown-btn'
          className={ styles.dropdownButton }
          role='button'
          onClick={ toggleDropdown } aria-label='open list'
        >
          { expanded ? collapseButtonIcon : expandButtonIcon }
        </span>
      </div>

      { /* Value */ }
      <input
        type="hidden"
        value={ selection && isMultiple(selection)
          ? JSON.stringify(selection.map(option => option.value))
          : selection?.value || ''
        }
        name={ name }
        data-testid='selected-option-value'
      />

      { /* Dropdown */ }
      { expanded &&
        <div id='select__dropdown-list' className={ styles.dropdown }>

          <input
            id='select__searchbox'
            ref={ inputRef }
            type="search"
            className={ styles.searchbox }
            onInput={ filterOptions }
            tabIndex={ 0 }
            value={ search }
            aria-label='search options'
            aria-controls='select__options'
          />

          <div
            className='select__options'
            aria-live='polite'
            role='listbox'
            aria-multiselectable={ multiple }
          >
            { filteredOptions.length > 0
              ? filteredOptions.reduce(
                ([options, group]: [ReactNode[], string], option: OptionType, index: number): [ReactNode[], string] =>
                {
                  const optionGroup = option.group || ''

                  if (optionGroup && optionGroup !== group) {
                    options.push(
                      <div key={ optionGroup } className={ styles.optionGroupLabel } aria-label={ optionGroup }>
                        { optionGroup }
                      </div>
                    )
                  }

                  options.push(
                    <Option
                      key={ option.value }
                      option={ option }
                      selected={ selectionSet.has(option.value) }
                      focused={ focusedOptionIndex === index }
                      onPressed={ setIgnoreBlurEvent }
                      onClicked={ e => handleOptionClicked(e, option) }
                      onHover={ e => handleOptionHover(e, option) }
                    />
                  )
                  return [options, optionGroup || '']
                }, [[], ''])
                [0]
              : <div role='option' className={ styles.noDataMessage } aria-label='no data avaliable'>
                  { noDataMessage }
                </div>
            }
          </div>
        </div>
      }
    </div>
  )
}

export default Select