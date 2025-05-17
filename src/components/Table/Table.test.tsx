import { render, screen, within } from '@testing-library/react'
import Table, { TableColumns } from './Table.tsx'

type TestData = {
  id: number,
  name: string,
  family: string,
  type: string,
}

describe('Table', () => {

  const columns: TableColumns<TestData> = [
    { name: 'Name', data: item => `${item.name}`},
    { name: 'Family', data: item => `${item.family}`},
    { name: 'Type', data: item => `${item.type}`},
  ]

  const collection: TestData[] = [
    { id: 1, name: 'Cat', family: 'Feline', type: 'Pet' },
    { id: 2, name: 'Dog', family: 'Canine', type: 'Pet' },
    { id: 3, name: 'Lion', family: 'Feline', type: 'Wild' }
  ]

  const getTestData = ({ row, col }: {row: number, col: number}) => {
    const dataRow = collection[row]

    switch (col) {
      case 0 :
        return dataRow.name

      case 1 :
        return dataRow.family

      case 2 :
        return dataRow.type
    }
  }

  const tableHeader = [ 'Name', 'Family', 'Type' ]

  describe('Without data', () => {
    test('renders header', () => {
      render(<Table data={ [] } columns={ columns } />)

      const headerCells = screen.getAllByRole('columnheader')

      headerCells.forEach((cell, i) => {
        expect(cell.textContent).toBe(tableHeader[i])
      })
    })

    test('renders empty message', () => {
      render(<Table data={ [] } columns={ columns } />)

      const emptyMessage = screen.getByText('No data available')
      expect(emptyMessage).toBeDefined()
    })

    test('renders custom empty message', () => {
      render(<Table data={ [] } columns={ columns } noEntriesMessage='No entries'/>)

      const emptyMessage = screen.getByText('No entries')
      expect(emptyMessage).toBeDefined()
    })
  })

  describe('With data', () => {
    test('renders collection', () => {
      render(<Table data={ collection } columns={ columns }/>)

      const rows = screen.getAllByRole('row')

      rows.slice(1).forEach((row, rowIndex) => {
        const cells = within(row).getAllByRole('cell')
        cells.forEach((cell, colIndex) => {
          expect(cell.textContent)
            .toBe(getTestData({ row: rowIndex, col: colIndex}))
        })
      })
    })

    test('renders rows that pass the search', () => {
      render(<Table data={ collection } columns={ columns } search='dog' />)

      const rows = screen.getAllByRole('row')

      expect(rows.length).toBe(2)   // 2 = header row + data row

      const filteredRow = rows[1]
      const cells = within(filteredRow).getAllByRole('cell')

      expect(cells[0].textContent).toBe('Dog')
    })

    test('renders rows that pass the filter', () => {
      render(<Table data={ collection } columns={ columns } filter={{
          'Family': 'feline',
          'Type': 'wild',
        }}
      />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(2)   // 2 = header row + data row

      const filteredRow = rows[1]
      const cells = within(filteredRow).getAllByRole('cell')
      expect(cells[0].textContent).toBe('Lion')
    })

    test('renders rows that pass the filter and search', () => {
      render(<Table data={ collection } columns={ columns } search='cat' filter={{
          'Family': 'feline'
        }}
      />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(2)   // 2 = header row + data row

      const filteredRow = rows[1]
      const cells = within(filteredRow).getAllByRole('cell')
      expect(cells[0].textContent).toBe('Cat')
    })
  })

})