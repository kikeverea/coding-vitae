import {render, screen, within} from '@testing-library/react'
import Table from './Table.tsx'

describe('Table', () => {

  const tableHeader = [ 'Col-1', 'Col-2', 'Col-3' ]
  const data = [
    [{ id: '1-1', data: 'Row 1, Col 1'}, { id: '1-2', data: 'Row 1, Col 2'}, { id: '1-3', data: 'Row 1, Col 3'}],
    [{ id: '2-1', data: 'Row 2, Col 1'}, { id: '2-2', data: 'Row 2, Col 2'}, { id: '2-3', data: 'Row 2, Col 3'}],
    [{ id: '3-1', data: 'Row 3, Col 1'}, { id: '3-2', data: 'Row 3, Col 2'}, { id: '3-3', data: 'Row 3, Col 3'}]
  ]

  describe('Without data', () => {
    beforeEach(() => {
      render(<Table header={ tableHeader } data={ null }/>)
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
      render(<Table header={ tableHeader } data={ data }/>)
    })

    test('renders data', () => {
      const rows = screen.getAllByRole('row')

      rows.forEach((row, rowIndex) => {
        const cells = within(row).getAllByRole('cell')
        cells.forEach((cell, colIndex) => {
          expect(cell.textContent).toBe(`Row ${rowIndex + 1}, Col ${colIndex + 1}`)
        })
      })
    })
  })

  test('')
})