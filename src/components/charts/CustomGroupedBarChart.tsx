/**
 * Custom Grouped Bar Chart Component using D3.js
 * Complete control over design to match Figma specifications exactly
 */

'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface GroupedSpendingData {
  groupName: string
  groupColor: string
  groupIcon?: string
  totalSpent: number
  totalAllocated: number
  categories: {
    name: string
    spent: number
    allocated: number
    color: string
  }[]
}

interface CustomGroupedBarChartProps {
  groupedData: GroupedSpendingData[]
  height?: number
  className?: string
  showBudgetComparison?: boolean
  animate?: boolean
}

export const CustomGroupedBarChart = React.memo(function CustomGroupedBarChart({
  groupedData,
  height = 400,
  className = '',
  showBudgetComparison = true,
  animate = true
}: CustomGroupedBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!groupedData.length) {
      setIsLoading(false)
      return
    }

    if (!svgRef.current && retryCount < 5) {
      const timeout = setTimeout(() => {
        setRetryCount(prev => prev + 1)
      }, 100)
      return () => clearTimeout(timeout)
    }

    if (!svgRef.current) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove()

    // Chart dimensions and margins
    const width = svgRef.current.clientWidth
    const margin = { top: 40, right: 40, bottom: 120, left: 40 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // Create main SVG group
    const svg = d3.select(svgRef.current)
    const chartGroup = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    // Transform data
    const chartData = groupedData.map(group => ({
      groupName: group.groupName,
      totalAllocated: group.totalAllocated,
      spent: Math.min(group.totalSpent, group.totalAllocated),
      remaining: Math.max(0, group.totalAllocated - group.totalSpent),
      overspent: Math.max(0, group.totalSpent - group.totalAllocated)
    }))

    // Create scales
    const xScale = d3.scaleBand()
      .domain(chartData.map(d => d.groupName))
      .range([0, chartWidth])
      .padding(0.3)

    const maxValue = d3.max(chartData, d => d.totalAllocated + d.overspent) || 0
    const yScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([chartHeight, 0])

    // Create gradient definitions
    const defs = svg.append('defs')
    
    // Light blue gradient for spent amount
    const spentGradient = defs.append('linearGradient')
      .attr('id', 'spentGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')
    
    spentGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#DBF3FF')
    
    spentGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#FAFDFF')

    // Red gradient for overspent amount
    const overspentGradient = defs.append('linearGradient')
      .attr('id', 'overspentGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')
    
    overspentGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#FCDBDB')
    
    overspentGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#FEF6F6')

    // Create grid lines
    const gridLines = chartGroup.append('g')
      .attr('class', 'grid')

    const yTicks = yScale.ticks(4)
    gridLines.selectAll('.grid-line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#f3f4f6')
      .attr('stroke-width', 1)

    // Create bars for each group
    const barGroups = chartGroup.selectAll('.bar-group')
      .data(chartData)
      .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', d => `translate(${xScale(d.groupName)}, 0)`)

    const barWidth = xScale.bandwidth()

    // Draw remaining (gray background) bars first
    const remainingBars = barGroups.append('rect')
      .attr('class', 'remaining-bar')
      .attr('x', 0)
      .attr('width', barWidth)
      .attr('fill', '#E5E7EB')
      
    if (animate) {
      remainingBars
        .attr('y', yScale(0))
        .attr('height', 0)
        .attr('opacity', 0.8)
        .transition()
        .duration(500)
        .delay((d, i) => i * 80)
        .ease(d3.easeCubicOut)
        .attr('y', d => yScale(d.totalAllocated))
        .attr('height', d => yScale(0) - yScale(d.totalAllocated))
        .attr('opacity', 1)
    } else {
      remainingBars
        .attr('y', d => yScale(d.totalAllocated))
        .attr('height', d => yScale(0) - yScale(d.totalAllocated))
    }

    // Draw spent (gradient) bars
    const spentBars = barGroups.append('rect')
      .attr('class', 'spent-bar')
      .attr('x', 0)
      .attr('width', barWidth)
      .attr('fill', 'url(#spentGradient)')
      
    if (animate) {
      spentBars
        .attr('y', yScale(0))
        .attr('height', 0)
        .attr('opacity', 0.7)
        .transition()
        .duration(600)
        .delay((d, i) => i * 100 + 150)
        .ease(d3.easeCubicOut)
        .attr('y', d => yScale(d.spent))
        .attr('height', d => yScale(0) - yScale(d.spent))
        .attr('opacity', 1)
    } else {
      spentBars
        .attr('y', d => yScale(d.spent))
        .attr('height', d => yScale(0) - yScale(d.spent))
    }

    // Draw overspent (red gradient) bars if any
    const overspentBars = barGroups.filter(d => d.overspent > 0)
      .append('rect')
      .attr('class', 'overspent-bar')
      .attr('x', 0)
      .attr('width', barWidth)
      .attr('fill', 'url(#overspentGradient)')
      
    if (animate && overspentBars.size() > 0) {
      overspentBars
        .attr('y', d => yScale(d.totalAllocated))
        .attr('height', 0)
        .attr('opacity', 0.7)
        .transition()
        .duration(500)
        .delay((d, i) => i * 100 + 300)
        .ease(d3.easeBackOut.overshoot(1.2))
        .attr('y', d => yScale(d.totalAllocated + d.overspent))
        .attr('height', d => yScale(0) - yScale(d.overspent))
        .attr('opacity', 1)
    } else if (overspentBars.size() > 0) {
      overspentBars
        .attr('y', d => yScale(d.totalAllocated + d.overspent))
        .attr('height', d => yScale(0) - yScale(d.overspent))
    }

    // Add 2px strokes on top of spent bars
    const spentStrokes = barGroups.append('line')
      .attr('class', 'spent-stroke')
      .attr('x1', 0)
      .attr('x2', barWidth)
      .attr('stroke', '#86D6FF')
      .attr('stroke-width', 2)
      
    if (animate) {
      spentStrokes
        .attr('y1', d => yScale(d.spent))
        .attr('y2', d => yScale(d.spent))
        .attr('opacity', 0)
        .transition()
        .duration(300)
        .delay((d, i) => i * 80 + 600)
        .ease(d3.easeCubicOut)
        .attr('opacity', 1)
    } else {
      spentStrokes
        .attr('y1', d => yScale(d.spent))
        .attr('y2', d => yScale(d.spent))
    }

    // Add 2px strokes on top of overspent bars
    const overspentStrokes = barGroups.filter(d => d.overspent > 0)
      .append('line')
      .attr('class', 'overspent-stroke')
      .attr('x1', 0)
      .attr('x2', barWidth)
      .attr('stroke', '#FF6B85')
      .attr('stroke-width', 2)
      
    if (animate && overspentStrokes.size() > 0) {
      overspentStrokes
        .attr('y1', d => yScale(d.totalAllocated + d.overspent))
        .attr('y2', d => yScale(d.totalAllocated + d.overspent))
        .attr('opacity', 0)
        .transition()
        .duration(300)
        .delay((d, i) => i * 80 + 700)
        .ease(d3.easeCubicOut)
        .attr('opacity', 1)
    } else if (overspentStrokes.size() > 0) {
      overspentStrokes
        .attr('y1', d => yScale(d.totalAllocated + d.overspent))
        .attr('y2', d => yScale(d.totalAllocated + d.overspent))
    }

    // Add x-axis labels
    const xLabels = chartGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${chartHeight + 32})`)
      .selectAll('.x-label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'x-label')
      .attr('x', d => (xScale(d.groupName) || 0) + barWidth / 2)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .attr('fill', '#374151')
      .text(d => d.groupName)
      
    if (animate) {
      xLabels
        .attr('opacity', 0)
        .attr('transform', 'translate(0, 8)')
        .transition()
        .duration(300)
        .delay((d, i) => i * 60 + 800)
        .ease(d3.easeCubicOut)
        .attr('opacity', 1)
        .attr('transform', 'translate(0, 0)')
    }

    // Add tooltip functionality
    const tooltip = d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'white')
      .style('padding', '12px 16px')
      .style('border', '1px solid #e5e7eb')
      .style('border-radius', '8px')
      .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
      .style('font-size', '14px')
      .style('z-index', '1000')

    // Add hover interactions
    barGroups.selectAll('rect')
      .on('mouseover', function(event, d) {
        const barType = d3.select(this).attr('class')
        let label = 'Total Budget'
        let value = d.totalAllocated
        
        if (barType === 'spent-bar') {
          label = 'Spent'
          value = d.spent
        } else if (barType === 'overspent-bar') {
          label = 'Overspent'
          value = d.overspent
        }

        tooltip.html(`
          <div style="font-weight: 600; margin-bottom: 4px; color: #1f2937;">
            ${d.groupName} - ${label}
          </div>
          <div style="color: #6b7280;">
            $${value.toLocaleString()}
          </div>
        `)
        .style('visibility', 'visible')
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px')
      })
      .on('mouseout', function() {
        tooltip.style('visibility', 'hidden')
      })

    // Mark loading as complete after animations
    if (animate) {
      setTimeout(() => setIsLoading(false), 1200)
    } else {
      setIsLoading(false)
    }

    // Cleanup tooltip on component unmount
    return () => {
      d3.select('.chart-tooltip').remove()
    }

  }, [groupedData, height, showBudgetComparison, animate, retryCount])

  if (groupedData.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <div>No spending data available</div>
        </div>
      </div>
    )
  }
  

  return (
    <div className={`${className} w-full relative`}>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        style={{ overflow: 'visible' }}
      />
    </div>
  )
})

export default CustomGroupedBarChart