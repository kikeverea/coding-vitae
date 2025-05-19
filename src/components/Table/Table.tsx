import { isValidElement, ReactNode, useMemo } from 'react'

export type Entity = { id: number | string }

type TableFilter = {
  [column: string]: string | { min?: number | string, max?: number | string, parser?: (value: string) => number }
}

export type TableColumn<T extends Entity> = {
  name: string,
  data: (item: T) => ReactNode
}

type TableProps<T extends Entity> = {
  collection: T[] | null | undefined
  columns: TableColumn<T>[],
  search?: string,
  filter?: TableFilter,
  noEntriesMessage?: string
}


const Table = <T extends Entity>(
  {
  collection,
  columns,
  search,
  filter,
  noEntriesMessage
}: TableProps<T>) => {

  const header = useMemo(() => columns.map(col => col.name), [columns])

  const rows = collection?.length
    ? collection.filter(item => applySearchAndFilter(item, columns, search, filter))
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

export const extractValue = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number')
    return String(node)

  if (Array.isArray(node))
    return node.map(extractValue).join('')


  if (isValidElement<{ children?: ReactNode }>(node))
    return extractValue(node.props.children)

  return ''
}

function applySearchAndFilter<T extends Entity>(
  item: T,
  columns: TableColumn<T>[],
  search?: string,
  filter?: TableFilter
): boolean {

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