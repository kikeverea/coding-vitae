import { render, screen, within } from '@testing-library/react'
import Table, { TableColumns } from './Table.tsx'

type TestData = {
  id: number,
  name: string,
  family: string,
  type: string,
  age: number,
}

describe('Table', () => {

  const columns: TableColumns<TestData> = [
    { name: 'Name', data: item => `${item.name}`},
    { name: 'Family', data: item => `${item.family}`},
    { name: 'Type', data: item => `${item.type}`},
    { name: 'Age', data: item => `${item.age}`},
  ]

  const collection: TestData[] = [
    { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10 },
    { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5 },
    { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13 },
    { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16 },
  ]

  const getTestData = ({ row, col }: { row: number, col: number }) => {
    const dataRow = collection[row]

    switch (col) {
      case 0 :
        return String(dataRow.name)

      case 1 :
        return String(dataRow.family)

      case 2 :
        return String(dataRow.type)

      case 3 :
        return String(dataRow.age)
    }
  }

  const tableHeader = [ 'Name', 'Family', 'Type', 'Age' ]

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

    test('renders empty message if no row passes the search', () => {
      render(<Table data={ collection } columns={ columns } search='no-rows' />)

      const rows = screen.getAllByRole('row')

      expect(rows.length).toBe(2)   // 2 = header row + empty message row

      const emptyMessageRow = rows[1]
      const cells = within(emptyMessageRow).getAllByRole('cell')

      expect(cells[0].textContent).toBe('No data available')
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

    test('renders empty message if no row passes the filter', () => {
      render(<Table data={ collection } columns={ columns } filter={{
        'Family': 'feline',
        'Name': 'dog',
      }} />)

      const rows = screen.getAllByRole('row')

      expect(rows.length).toBe(2)   // 2 = header row + empty message row

      const emptyMessageRow = rows[1]
      const cells = within(emptyMessageRow).getAllByRole('cell')

      expect(cells[0].textContent).toBe('No data available')
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

    test('renders empty message if no row passes the filter and search', () => {
      render(<Table data={ collection } columns={ columns } search='dog' filter={{ 'Family': 'feline' }} />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(2)   // 2 = header row + empty message row

      const emptyMessageRow = rows[1]
      const cells = within(emptyMessageRow).getAllByRole('cell')

      expect(cells[0].textContent).toBe('No data available')
    })

    test('renders rows that pass the range filter', () => {
      render(<Table data={ collection } columns={ columns } filter={{ 'Age': { min: 8, max: 15 } }} />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(3)   // 3 = header row + 2 data rows

      const catRow = rows[1]
      const lionRow = rows[2]

      const catCells = within(catRow).getAllByRole('cell')
      const lionCells = within(lionRow).getAllByRole('cell')

      expect(catCells[0].textContent).toBe('Cat')
      expect(lionCells[0].textContent).toBe('Lion')
    })

    test('renders rows that pass the range filter, edge cases', () => {
      render(<Table data={ collection } columns={ columns } filter={{ 'Age': { min: 10, max: 13 } }} />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(3)   // 3 = header row + 2 data rows

      const catRow = rows[1]
      const lionRow = rows[2]

      const catCells = within(catRow).getAllByRole('cell')
      const lionCells = within(lionRow).getAllByRole('cell')

      expect(catCells[0].textContent).toBe('Cat')
      expect(lionCells[0].textContent).toBe('Lion')
    })


    test('renders empty message if no row passes the range filter', () => {
      render(<Table data={ collection } columns={ columns } filter={{ 'Age': { min: 18, max: 20 } }} />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(2)   // 2 = header row + empty message row

      const emptyMessageRow = rows[1]
      const cells = within(emptyMessageRow).getAllByRole('cell')

      expect(cells[0].textContent).toBe('No data available')
    })

    test('renders rows that pass a min range filter', () => {
      render(<Table data={ collection } columns={ columns } filter={{ 'Age': { min: 12 } }} />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(3)   // 2 = header row + 2 data rows

      const lionRows = rows[1]
      const seaLionRows = rows[2]

      const lionCells = within(lionRows).getAllByRole('cell')
      const seaLionCells = within(seaLionRows).getAllByRole('cell')

      expect(lionCells[0].textContent).toBe('Lion')
      expect(seaLionCells[0].textContent).toBe('Sea Lion')
    })

    test('renders empty message if no row passes the min range filter', () => {
      render(<Table data={ collection } columns={ columns } filter={{ 'Age': { min: 18 } }} />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(2)   // 2 = header row + empty message row

      const emptyMessageRow = rows[1]
      const cells = within(emptyMessageRow).getAllByRole('cell')

      expect(cells[0].textContent).toBe('No data available')
    })

    test('renders rows that pass the max range filter', () => {
      render(<Table data={ collection } columns={ columns } filter={{ 'Age': { max: 12 } }} />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(3)   // 3 = header row + 2 data rows

      const catRow = rows[1]
      const dogRow = rows[2]

      const catCells = within(catRow).getAllByRole('cell')
      const dogCells = within(dogRow).getAllByRole('cell')

      expect(catCells[0].textContent).toBe('Cat')
      expect(dogCells[0].textContent).toBe('Dog')
    })

    test('renders empty message if no row passes the max range filter', () => {
      render(<Table data={ collection } columns={ columns } filter={{ 'Age': { max: 2 } }} />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(2)   // 2 = header row + empty message row

      const emptyMessageRow = rows[1]
      const cells = within(emptyMessageRow).getAllByRole('cell')

      expect(cells[0].textContent).toBe('No data available')
    })

    test('renders rows that pass a range filter, filter and search', () => {
      render(<Table
        data={ collection }
        columns={ columns }
        filter={{ 'Age': { min: 8, max: 16 }, 'Family': 'feline' }}
        search='Lion'
      />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(2)   // 2 = header row + data row

      const filteredRow = rows[1]
      const cells = within(filteredRow).getAllByRole('cell')

      expect(cells[0].textContent).toBe('Lion')
    })
  })
})