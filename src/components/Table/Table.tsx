import { isValidElement, ReactNode, useMemo } from 'react'

export type Entity = { id: number | string }

type TableFilter = {
  [column: string]: string | { min?: number | string, max?: number | string, parser?: (value: string) => number }
}

export type TableColumns<T extends Entity> = {
  name: string,
  data: (item: T) => ReactNode
}[]

type TableProps<T extends Entity> = {
  collection: T[] | null | undefined
  columns: TableColumns<T>,
  search?: string,
  filter?: TableFilter,
  noEntriesMessage?: string
}

type RowProps<T extends Entity> = {
  collection: T[]
  columns: TableColumns<T>,
  search?: string,
  filter?: TableFilter,
  noEntriesMessage?: string
}

type ColumnProps<T extends Entity> = {
  item: T,
  data: (item: T) => ReactNode | string,
  name: string
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

  return (
    <table role='table'>
      <thead>
        <tr>
          { header.map(headerName => <th key={ headerName }>{ headerName }</th>) }
        </tr>
      </thead>
      <tbody>
        { collection && collection.length
          ? search || filter
            ? renderFilteredRows({ collection, columns, search, filter, noEntriesMessage })
            : collection.map(item =>
              <tr key={ item.id }>
                { columns.map(column => <td key={ `${item.id}-${column.name}` }>{ column.data(item) }</td>) }
              </tr>
            )
          : renderNoEntriesRow(noEntriesMessage)
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

const renderFilteredRows = <T extends Entity>({ collection , columns, search='', filter, noEntriesMessage }: RowProps<T>): ReactNode[] => {

  const rows: ReactNode[] = []

  for (const item of collection) {

    let passesFilter = true
    let passesSearch = false

    const rowColumns = []

    for (const column of columns) {
      const cellContent = column.data(item)
      const value = extractValue(cellContent)?.toLowerCase()
      const filterValue = filter && filter[column.name]

      passesFilter = passesFilter && (!filterValue || evaluateFilter(filterValue, value))
      passesSearch = passesFilter && (passesSearch || !search || value.includes(search.toLowerCase()))

      rowColumns.push(renderColumn({ name: column.name, item, data: column.data }))
    }

    if (passesFilter && passesSearch)
      rows.push(renderRow({ item, columns: rowColumns }))
  }

  return rows.length
    ? rows
    : [renderNoEntriesRow(noEntriesMessage)]
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

const renderColumn = <T extends Entity>({ name, item, data }: ColumnProps<T>) => {
  return <td key={ `${item.id}-${name}` }>{ data(item) }</td>
}

const renderRow = <T extends Entity>({ item, columns }: { item: T, columns: ReactNode[] }) => {
  return <tr key={ item.id }>{ columns }</tr>
}

const renderNoEntriesRow = (message?: string) => {
  return (
    <tr key='empty-message'>
      <td>{ message || 'No data available' }</td>
    </tr>
  )
}

export default Table