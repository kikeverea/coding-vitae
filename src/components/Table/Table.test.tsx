import { render, screen, within } from '@testing-library/react'
import Table, { TableColumns } from './Table.tsx'

type TestData = {
  id: number | string,
  index: number
}

describe('Table', () => {

  const columns: TableColumns<TestData> = [
    { name: 'Col-1', data: item => `Row-${item.index}, Col-1`},
    { name: 'Col-2', data: item => `Row-${item.index}, Col-2`},
    { name: 'Col-3', data: item => `Row-${item.index}, Col-3`}
  ]

  const collection: TestData[] = [
    { id: 1, index: 1 },
    { id: 2, index: 2 },
    { id: 3, index: 3 }
  ]

  const tableHeader = [ 'Col-1', 'Col-2', 'Col-3' ]

  describe('Without data', () => {
    beforeEach(() => {
      render(<Table data={ [] } columns={ columns }/>)
    })

    test('renders header', () => {
      const headerCells = screen.getAllByRole('columnheader')

      headerCells.forEach((cell, i) => {
        expect(cell.textContent).toBe(tableHeader[i])
      })
    })

    test('renders empty message', () => {
      const emptyMessage = screen.getByText('No data available')
      expect(emptyMessage).toBeDefined()
    })
  })

  describe('With data', () => {
    beforeEach(() => {
      render(<Table data={ collection } columns={ columns }/>)
    })

    test('renders data', () => {
      const rows = screen.getAllByRole('row')

      rows.slice(1).forEach((row, rowIndex) => {
        const cells = within(row).getAllByRole('cell')
        cells.forEach((cell, colIndex) => {
          expect(cell.textContent).toBe(`Row-${rowIndex + 1}, Col-${colIndex + 1}`)
        })
      })
    })
  })

  describe('With search', () => {
    beforeEach(() => {
      render(<Table data={ collection } columns={ columns } search='Row-2' />)
    })

    test('renders rows that passes the search param', () => {
      const rows = screen.getAllByRole('row')

      expect(rows.length).toBe(2)   // 2 = header row + data row

      const filteredRow = rows[1]
      const cells = within(filteredRow).getAllByRole('cell')
      cells.forEach((cell, colIndex) => {
        expect(cell.textContent).toBe(`Row-2, Col-${colIndex + 1}`)
      })
    })
  })
})