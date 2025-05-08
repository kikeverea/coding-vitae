import { isValidElement, ReactNode, useMemo } from 'react'

export type Entity = { id: number | string }

export type TableColumns<T extends Entity> = {
  name: string,
  data: (item: T) => ReactNode
}[]

type TableProps<T extends Entity> = {
  data: T[] | null | undefined
  columns: TableColumns<T>,
  search?: string
}

type RowProps<T extends Entity> = {
  data: T[]
  columns: TableColumns<T>,
  search: string
}

type ColumnProps<T extends Entity> = {
  item: T,
  data: (item: T) => ReactNode | string,
  name: string
}

const Table = <T extends Entity>({ data, columns, search }: TableProps<T>) => {

  const header = useMemo(() => columns.map(col => col.name), [columns])

  return (
    <table role='table'>
      <thead>
        <tr>
          { header.map(headerName => <th key={ headerName }>{ headerName }</th>) }
        </tr>
      </thead>
      <tbody>
        { data && data.length
          ? search
            ? renderRowsWithSearch({ data, columns, search })
            : data.map(item =>
              <tr key={ item.id }>
                { columns.map(column => <td key={ `${item.id}-${column.name}` }>{ column.data(item) }</td>) }
              </tr>
            )
          : <tr>
              <td>{ 'No data available' }</td>
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

const renderRowsWithSearch = <T extends Entity>({ data, columns, search }: RowProps<T>): ReactNode[] => {

  const rows: ReactNode[] = []

  for (const item of data) {

    let passesFilter = false
    const rowColumns = []

    for (const column of columns) {
      const cellContent = column.data(item)
      const value = extractValue(cellContent)

      passesFilter = passesFilter || value.toLowerCase().includes(search.toLowerCase())
      rowColumns.push(renderColumn({ name: column.name, item, data: column.data }))
    }

    passesFilter && rows.push(renderRow({ item, columns: rowColumns }))
  }
  return rows
}

const renderColumn = <T extends Entity>({ name, item, data }: ColumnProps<T>) => {
  return <td key={ `${item.id}-${name}` }>{ data(item) }</td>
}

const renderRow = <T extends Entity>({ item, columns }: { item: T, columns: ReactNode[] }) => {
  return <tr key={ item.id }>{ columns }</tr>
}

export default Table