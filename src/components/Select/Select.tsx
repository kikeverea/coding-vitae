import {FormEvent, useState} from 'react'

export type Option = {
  name: string
  value: string
}

type SelectProps = {
  options: Option[]
}

const Select = ({ options } : SelectProps) => {
  const [ search, setSearch ] = useState('')

  const filterOptions = (e: FormEvent<HTMLInputElement>) => {
    console.log('filtering options with', e.currentTarget.value)
    const input = e.currentTarget as HTMLInputElement
    setSearch(input.value)
  }

  const showSearch = options.length > 0

  const filteredOptions = options.filter(
    option => option.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <select>
       { filteredOptions.length > 0
         ? filteredOptions.map(option =>
           <option value={ option.value } key={ option.value }>{ option.name }</option>)
         : <option>{ 'No data available' }</option>
       }
      </select>
      { showSearch &&
        <span>
          <input type="search" onInput={ filterOptions }></input>
        </span>
      }
    </>
  )
}

export default Select