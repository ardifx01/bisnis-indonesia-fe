import React, { useMemo } from 'react'

import Card from '@mui/material/Card'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import tableStyles from '@core/styles/table.module.css'

export interface TableColumn<T> {
  header: string | React.ReactNode | (() => React.ReactNode)
  accessor: (row: T) => React.ReactNode
  className?: string
  headerClassName?: string
  sortable?: boolean
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  error?: string
  emptyText?: string
  sortBy?: string
  setSortBy?: (sortBy: string) => void
  sortOrder?: 'asc' | 'desc'
  setSortOrder?: (sortOrder: 'asc' | 'desc') => void
}

const Table = <T,>({
  data,
  columns,
  loading,
  error,
  emptyText = 'No data available',
  sortBy,
  setSortBy,
  sortOrder = 'asc',
  setSortOrder
}: TableProps<T>) => {
  const sortedData = useMemo(() => {
    if (!sortBy || !setSortBy) return data

    const sortableColumn = columns.find(col => String(col.header) === sortBy)

    if (!sortableColumn) return data

    return [...data].sort((a, b) => {
      const aValue = sortableColumn.accessor(a)
      const bValue = sortableColumn.accessor(b)

      let aStr = String(aValue)
      let bStr = String(bValue)

      // Handle numeric values
      const aNum = Number(aStr)
      const bNum = Number(bStr)

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortOrder === 'asc' ? aNum - bNum : bNum - aNum
      }

      // Handle string values
      aStr = aStr.toLowerCase()
      bStr = bStr.toLowerCase()

      if (aStr < bStr) return sortOrder === 'asc' ? -1 : 1
      if (aStr > bStr) return sortOrder === 'asc' ? 1 : -1

      return 0
    })
  }, [data, sortBy, sortOrder, columns, setSortBy])

  const handleSort = (column: TableColumn<T>) => {
    if (!setSortBy || !setSortOrder || column.sortable === false) return

    const headerString = String(column.header)

    if (sortBy === headerString) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(headerString)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (column: TableColumn<T>) => {
    if (column.sortable === false) return null

    const headerString = String(column.header)
    const isActive = sortBy === headerString

    if (isActive) {
      return sortOrder === 'asc' ? ' ↑' : ' ↓'
    }

    return ' ⇅'
  }

  if (loading) {
    return (
      <Card>
        <div className='flex justify-center items-center p-4'>
          <CircularProgress />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <div className='flex justify-center items-center p-4'>
          <Typography color='error'>{error}</Typography>
        </div>
      </Card>
    )
  }

  const renderHeader = (header: TableColumn<T>['header']) => {
    if (typeof header === 'function') {
      return header()
    }

    return header
  }

  return (
    <Card>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`${column.className || ''} ${column.headerClassName || ''}`}
                  style={{
                    cursor: setSortBy && column.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort(column)}
                >
                  {renderHeader(column.header)}
                  {getSortIcon(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length > 0 ? (
              sortedData.map((row, index) => (
                <tr key={index}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className='!plb-1'>
                      {column.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className='text-center p-4'>
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default Table
