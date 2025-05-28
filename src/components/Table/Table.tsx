import { isValidElement, ReactNode, useMemo } from 'react'
import { Entity, TableColumn, TableFilter, TableProps } from './types/types.ts'

const Table = <T extends Entity>(
  {
  collection,
  columns,
  search,
  filter,
  sort,
  noEntriesMessage
}: TableProps<T>) => {

  const header = useMemo(() => columns.map(col => col.name), [columns])

  const rows = collection?.length
    ? collection
      .filter(item => applySearchAndFilter(item, columns, search, filter))
      .sort((item1, item2) => applySort(item1, item2, columns, sort))
    : null

  return (
    <table role='table'>
      <thead>
        <tr>
          { header.map(headerName => <th key={ headerName }>{ headerName }</th>) }
        </tr>
      </thead>
      <tbody>
        { rows?.length
          ? rows.map(item =>
              <tr key={ item.id }>
                { columns.map(column =>
                  <td key={ `${item.id}-${column.name}` }>
                    { column.data(item) }
                  </td>)
                }
              </tr>
            )
          : <tr key='empty-message'>
              <td>{ noEntriesMessage || 'No data available' }</td>
            </tr>
        }
      </tbody>
    </table>
  )
}

const extractValue = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number')
    return String(node)

  if (Array.isArray(node))
    return node.map(extractValue).join('')


  if (isValidElement<{ children?: ReactNode }>(node))
    return extractValue(node.props.children)

  return ''
}

const applySearchAndFilter = <T extends Entity>(
  item: T,
  columns: TableColumn<T>[],
  search?: string,
  filter?: TableFilter
): boolean => {

  if (!search && !filter)
    return true

  let passesFilter = true
  let passesSearch = !search

  for (const column of columns) {
    const value = extractValue(column.data(item)).toLowerCase()
    const filterValue = filter?.[column.name]

    passesFilter = passesFilter && (!filterValue || evaluateFilter(filterValue, value))
    passesSearch = passesSearch || !search || value.includes(search.toLowerCase())
  }

  return passesFilter && passesSearch
}

const applySort = <T extends Entity>(
  item1: T,
  item2: T,
  columns: TableColumn<T>[],
  sort?: readonly [string, ('asc' | 'desc')?],
): number => {

  if (!sort)
    return 0

  const [sortColumn, sortDirection='asc'] = sort
  const column =
    columns.find(column => column.name.toLowerCase() === sortColumn.toLowerCase())

  if (!column)
    return 0

  const value1 = extractValue(column.data(item1)).toLowerCase()
  const value2 = extractValue(column.data(item2)).toLowerCase()

  return sortDirection === 'asc'
    ? value1.localeCompare(value2)
    : value2.localeCompare(value1)
}


const needsParsing = (value: unknown): value is string => typeof value === 'string'

const evaluateFilter = (filter: string | { min?: number | string, max?: number | string, parser?: (value: any) => number }, value: string): boolean => {

  const isRange = typeof filter !== 'string'

  if (isRange) {

    const { min, max, parser = (value: string) => parseInt(value) } = filter

    const minNumber = needsParsing(min) ? parser(min) : min
    const maxNumber = needsParsing(max) ? parser(max) : max
    const valueNumber = parser(value)

    if (minNumber !== undefined && maxNumber !== undefined)
      return valueNumber >= minNumber && valueNumber <= maxNumber

    else if (minNumber !== undefined)
      return valueNumber >= minNumber

    else if (maxNumber !== undefined)
      return valueNumber <= maxNumber

    else return true
  }
  else
    return value.includes(filter.toLowerCase())
}

export default Table