/**
 * Accessible Data Table Component
 * WCAG 2.1 AA compliant table for chart data fallback
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, EyeOff, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react'
import type { CategoryData, ChartStage } from '@/lib/types/chart-progression'
import { generateAccessibleDataTable } from '@/lib/utils/chart-accessibility'

interface AccessibleDataTableProps {
  categories: CategoryData[]
  stage: ChartStage
  isVisible?: boolean
  onToggleVisibility?: () => void
  className?: string
}

type SortField = 'name' | 'allocated' | 'spent' | 'remaining' | 'status'
type SortDirection = 'asc' | 'desc'

export function AccessibleDataTable({
  categories,
  stage,
  isVisible = false,
  onToggleVisibility,
  className = ''
}: AccessibleDataTableProps) {
  const [sortField, setSortField] = useState<SortField>('spent')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  const { headers, rows, caption } = generateAccessibleDataTable(categories, stage)
  
  // Remove the totals row for sorting
  const dataRows = rows.slice(0, -1)
  const totalsRow = rows[rows.length - 1]
  
  // Sort data
  const sortedRows = [...dataRows].sort((a, b) => {
    let aVal: string | number = a[getColumnIndex(sortField)]
    let bVal: string | number = b[getColumnIndex(sortField)]
    
    // Convert currency strings to numbers for proper sorting
    if (sortField === 'allocated' || sortField === 'spent' || sortField === 'remaining') {
      aVal = parseFloat(String(aVal).replace('$', '').replace(',', ''))
      bVal = parseFloat(String(bVal).replace('$', '').replace(',', ''))
    }
    
    if (sortDirection === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })
  
  function getColumnIndex(field: SortField): number {
    switch (field) {
      case 'name': return 0
      case 'allocated': return 1
      case 'spent': return 2
      case 'remaining': return 3
      case 'status': return 4
      default: return 0
    }
  }
  
  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }
  
  function getSortIcon(field: SortField) {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />
  }
  
  function getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Over budget':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Nearly spent':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'On track':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Within budget':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className={`accessible-data-table ${className}`}>
      {/* Toggle Button */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            Chart Data Table
          </h3>
          <p className="text-xs text-gray-600">
            Accessible table view of chart data for screen readers
          </p>
        </div>
        
        {onToggleVisibility && (
          <Button
            onClick={onToggleVisibility}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            aria-expanded={isVisible}
            aria-controls="accessible-data-table-content"
          >
            {isVisible ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Table
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show Data Table
              </>
            )}
          </Button>
        )}
      </div>
      
      {/* Table Content */}
      {isVisible && (
        <Card id="accessible-data-table-content">
          <CardHeader className="sr-only">
            <CardTitle>Spending Data Table</CardTitle>
            <CardDescription>{caption}</CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <Table>
              <caption className="sr-only">
                {caption}. Use column headers to sort data. Current sort: {sortField} {sortDirection}ending.
              </caption>
              
              <TableHeader>
                <TableRow>
                  {headers.map((header, index) => {
                    const field = ['name', 'allocated', 'spent', 'remaining', 'status'][index] as SortField
                    return (
                      <TableHead 
                        key={header}
                        className="text-left"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 font-semibold text-gray-900 hover:text-gray-700"
                          onClick={() => handleSort(field)}
                          aria-sort={
                            sortField === field 
                              ? sortDirection === 'asc' ? 'ascending' : 'descending'
                              : 'none'
                          }
                          aria-label={`Sort by ${header} ${
                            sortField === field 
                              ? sortDirection === 'asc' ? 'descending' : 'ascending'
                              : 'ascending'
                          }`}
                        >
                          <span>{header}</span>
                          {getSortIcon(field)}
                        </Button>
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {sortedRows.map((row, rowIndex) => (
                  <TableRow 
                    key={`${row[0]}-${rowIndex}`}
                    className="hover:bg-gray-50"
                  >
                    {row.map((cell, cellIndex) => (
                      <TableCell 
                        key={cellIndex}
                        className={cellIndex === 0 ? 'font-medium' : ''}
                      >
                        {cellIndex === 4 ? ( // Status column
                          <span 
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(cell)}`}
                            aria-label={`Status: ${cell}`}
                          >
                            {cell}
                          </span>
                        ) : cellIndex > 0 && cellIndex < 4 ? ( // Currency columns
                          <span 
                            className="font-mono text-sm"
                            aria-label={`${headers[cellIndex]}: ${cell}`}
                          >
                            {cell}
                          </span>
                        ) : (
                          cell
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                
                {/* Totals Row */}
                <TableRow className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                  {totalsRow.map((cell, cellIndex) => (
                    <TableCell 
                      key={cellIndex}
                      className={cellIndex === 0 ? 'font-bold' : 'font-semibold'}
                    >
                      {cellIndex === 4 ? ( // Status column
                        <span 
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(cell)}`}
                          aria-label={`Overall status: ${cell}`}
                        >
                          {cell}
                        </span>
                      ) : cellIndex > 0 && cellIndex < 4 ? ( // Currency columns
                        <span 
                          className="font-mono text-sm font-semibold"
                          aria-label={`Total ${headers[cellIndex].toLowerCase()}: ${cell}`}
                        >
                          {cell}
                        </span>
                      ) : (
                        cell
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Screen reader instructions */}
      <div className="sr-only" aria-live="polite">
        Table showing spending data for {categories.length} categories. 
        Data is currently sorted by {sortField} in {sortDirection}ending order.
        Use the column header buttons to change sorting.
      </div>
    </div>
  )
}

export default AccessibleDataTable