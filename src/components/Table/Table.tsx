import { FC } from 'react'

type TableData = {
  id: string | number
  [key: string]: any
}

type TableProps = {
  header: string[]
  data: TableData[] | null
}

const Table: FC<TableProps> = ({ header, data }) => {
  return (
    <table role='table'>
      <thead>
        { header.map(headerName => <th>{ headerName }</th>)}
      </thead>
      <tbody>
        { data
          ? data.map(row =>
              <tr key={ row.id }>
                { row.map(cell => <td>{ cell }</td>) }
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

export default Table