"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Maximize2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface RevenueChartProps {
  data: Array<{
    month: string
    revenue: number
  }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [previousData, setPreviousData] = useState(data)
  const animationRef = useRef<number>()

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const trend = data[data.length - 1]?.revenue > data[0]?.revenue
  const maxRevenue = Math.max(...data.map(d => d.revenue))
  const minRevenue = Math.min(...data.map(d => d.revenue))

  // Animation function for smooth transitions
  const animateToNewData = (fromData: typeof data, toData: typeof data, duration: number = 1000) => {
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
      const easedProgress = easeInOutCubic(progress)
      
      // Interpolate between old and new data
      const interpolatedData = toData.map((item, index) => ({
        month: item.month,
        revenue: fromData[index] 
          ? fromData[index].revenue + (item.revenue - fromData[index].revenue) * easedProgress
          : item.revenue * easedProgress
      }))
      
      drawChart(interpolatedData, easedProgress)
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    animate()
  }

  const drawChart = (chartData: typeof data, animationProgress: number = 1) => {
    if (!svgRef.current) return

    const svg = svgRef.current
    const width = 800
    const height = 400
    const margin = { top: 40, right: 40, bottom: 60, left: 80 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // Clear previous content
    svg.innerHTML = ''

    const currentMaxRevenue = Math.max(...chartData.map(d => d.revenue))
    const currentMinRevenue = Math.min(...chartData.map(d => d.revenue))

    // Create main group
    const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    mainGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`)
    svg.appendChild(mainGroup)

    // Create gradient definitions
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    
    // Area gradient
    const areaGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
    areaGradient.setAttribute('id', 'areaGradient')
    areaGradient.setAttribute('x1', '0%')
    areaGradient.setAttribute('y1', '0%')
    areaGradient.setAttribute('x2', '0%')
    areaGradient.setAttribute('y2', '100%')
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop1.setAttribute('offset', '0%')
    stop1.setAttribute('stop-color', '#6366f1')
    stop1.setAttribute('stop-opacity', (0.8 * animationProgress).toString())
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop2.setAttribute('offset', '100%')
    stop2.setAttribute('stop-color', '#6366f1')
    stop2.setAttribute('stop-opacity', (0.1 * animationProgress).toString())
    
    areaGradient.appendChild(stop1)
    areaGradient.appendChild(stop2)
    defs.appendChild(areaGradient)

    // Glow filter
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
    filter.setAttribute('id', 'glow')
    
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur')
    feGaussianBlur.setAttribute('stdDeviation', '3')
    feGaussianBlur.setAttribute('result', 'coloredBlur')
    
    const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge')
    const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode')
    feMergeNode1.setAttribute('in', 'coloredBlur')
    const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode')
    feMergeNode2.setAttribute('in', 'SourceGraphic')
    
    feMerge.appendChild(feMergeNode1)
    feMerge.appendChild(feMergeNode2)
    filter.appendChild(feGaussianBlur)
    filter.appendChild(feMerge)
    defs.appendChild(filter)

    svg.appendChild(defs)

    // Create grid lines
    const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    gridGroup.setAttribute('class', 'grid')
    
    for (let i = 0; i <= 5; i++) {
      const y = (chartHeight / 5) * i
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', '0')
      line.setAttribute('y1', y.toString())
      line.setAttribute('x2', chartWidth.toString())
      line.setAttribute('y2', y.toString())
      line.setAttribute('stroke', '#e2e8f0')
      line.setAttribute('stroke-width', '1')
      line.setAttribute('stroke-dasharray', '2,2')
      line.setAttribute('opacity', (0.6 * animationProgress).toString())
      
      gridGroup.appendChild(line)
    }
    mainGroup.appendChild(gridGroup)

    // Create scales
    const xScale = (index: number) => (chartWidth / (chartData.length - 1)) * index
    const yScale = (value: number) => chartHeight - ((value - currentMinRevenue) / (currentMaxRevenue - currentMinRevenue)) * chartHeight

    // Create area path
    let areaPath = `M 0 ${chartHeight}`
    chartData.forEach((point, index) => {
      const x = xScale(index)
      const y = yScale(point.revenue)
      if (index === 0) {
        areaPath += ` L ${x} ${y}`
      } else {
        areaPath += ` L ${x} ${y}`
      }
    })
    areaPath += ` L ${chartWidth} ${chartHeight} Z`

    const area = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    area.setAttribute('d', areaPath)
    area.setAttribute('fill', 'url(#areaGradient)')
    area.setAttribute('opacity', animationProgress.toString())
    
    mainGroup.appendChild(area)

    // Create line path
    let linePath = ''
    chartData.forEach((point, index) => {
      const x = xScale(index)
      const y = yScale(point.revenue)
      if (index === 0) {
        linePath += `M ${x} ${y}`
      } else {
        linePath += ` L ${x} ${y}`
      }
    })

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    line.setAttribute('d', linePath)
    line.setAttribute('fill', 'none')
    line.setAttribute('stroke', '#6366f1')
    line.setAttribute('stroke-width', '3')
    line.setAttribute('filter', 'url(#glow)')
    line.setAttribute('opacity', animationProgress.toString())
    
    mainGroup.appendChild(line)

    // Create data points with dynamic positioning
    chartData.forEach((point, index) => {
      const x = xScale(index)
      const y = yScale(point.revenue)
      
      // Outer glow circle
      const glowCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      glowCircle.setAttribute('cx', x.toString())
      glowCircle.setAttribute('cy', y.toString())
      glowCircle.setAttribute('r', (8 * animationProgress).toString())
      glowCircle.setAttribute('fill', '#6366f1')
      glowCircle.setAttribute('opacity', (0.3 * animationProgress).toString())
      glowCircle.setAttribute('class', 'glow-circle')
      
      // Main data point
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', x.toString())
      circle.setAttribute('cy', y.toString())
      circle.setAttribute('r', (5 * animationProgress).toString())
      circle.setAttribute('fill', '#ffffff')
      circle.setAttribute('stroke', '#6366f1')
      circle.setAttribute('stroke-width', '3')
      circle.setAttribute('class', 'data-point')
      circle.setAttribute('style', 'cursor: pointer; transition: all 0.3s ease;')
      
      // Hover effects
      circle.addEventListener('mouseenter', () => {
        setHoveredPoint(index)
        circle.setAttribute('r', '7')
        glowCircle.setAttribute('opacity', '0.6')
        
        // Show tooltip
        const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        tooltip.setAttribute('id', `tooltip-${index}`)
        
        const tooltipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        tooltipRect.setAttribute('x', (x - 40).toString())
        tooltipRect.setAttribute('y', (y - 50).toString())
        tooltipRect.setAttribute('width', '80')
        tooltipRect.setAttribute('height', '35')
        tooltipRect.setAttribute('fill', '#1f2937')
        tooltipRect.setAttribute('rx', '6')
        tooltipRect.setAttribute('opacity', '0.9')
        
        const tooltipText1 = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        tooltipText1.setAttribute('x', x.toString())
        tooltipText1.setAttribute('y', (y - 35).toString())
        tooltipText1.setAttribute('text-anchor', 'middle')
        tooltipText1.setAttribute('fill', '#ffffff')
        tooltipText1.setAttribute('font-size', '12')
        tooltipText1.setAttribute('font-weight', 'bold')
        tooltipText1.textContent = point.month
        
        const tooltipText2 = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        tooltipText2.setAttribute('x', x.toString())
        tooltipText2.setAttribute('y', (y - 20).toString())
        tooltipText2.setAttribute('text-anchor', 'middle')
        tooltipText2.setAttribute('fill', '#10b981')
        tooltipText2.setAttribute('font-size', '11')
        tooltipText2.textContent = `$${Math.round(point.revenue).toLocaleString()}`
        
        tooltip.appendChild(tooltipRect)
        tooltip.appendChild(tooltipText1)
        tooltip.appendChild(tooltipText2)
        mainGroup.appendChild(tooltip)
      })
      
      circle.addEventListener('mouseleave', () => {
        setHoveredPoint(null)
        circle.setAttribute('r', '5')
        glowCircle.setAttribute('opacity', '0.3')
        
        const tooltip = document.getElementById(`tooltip-${index}`)
        if (tooltip) tooltip.remove()
      })
      
      mainGroup.appendChild(glowCircle)
      mainGroup.appendChild(circle)
    })

    // Add axis labels
    const xAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    chartData.forEach((point, index) => {
      const x = xScale(index)
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', x.toString())
      text.setAttribute('y', (chartHeight + 25).toString())
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('fill', '#64748b')
      text.setAttribute('font-size', '12')
      text.setAttribute('opacity', animationProgress.toString())
      text.textContent = point.month.slice(0, 3)
      
      xAxisGroup.appendChild(text)
    })
    mainGroup.appendChild(xAxisGroup)

    // Y-axis labels
    const yAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    for (let i = 0; i <= 5; i++) {
      const value = currentMinRevenue + ((currentMaxRevenue - currentMinRevenue) / 5) * (5 - i)
      const y = (chartHeight / 5) * i
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', '-15')
      text.setAttribute('y', (y + 4).toString())
      text.setAttribute('text-anchor', 'end')
      text.setAttribute('fill', '#64748b')
      text.setAttribute('font-size', '12')
      text.setAttribute('opacity', animationProgress.toString())
      text.textContent = `$${(value / 1000).toFixed(0)}k`
      
      yAxisGroup.appendChild(text)
    }
    mainGroup.appendChild(yAxisGroup)
  }

  // Effect to handle data changes with smooth animation
  useEffect(() => {
    if (JSON.stringify(previousData) !== JSON.stringify(data)) {
      // Cancel any ongoing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      
      // Start animation from previous data to new data
      animateToNewData(previousData, data, 1200)
      setPreviousData(data)
    } else {
      // Initial render
      drawChart(data)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [data])

  return (
    <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/50">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 animate-pulse" />
      </div>
      
      <CardHeader className="relative pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              Revenue Analytics
              <Badge 
                variant={trend ? "default" : "secondary"} 
                className={`px-3 py-1 text-xs font-semibold transition-all duration-500 ${
                  trend 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                }`}
              >
                {trend ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {trend ? "Trending Up" : "Declining"}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground font-medium">
              Monthly revenue performance • Total: 
              <span className="font-bold text-green-600 ml-1 transition-all duration-500">
                ${totalRevenue.toLocaleString()}
              </span>
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="opacity-60 hover:opacity-100 transition-opacity">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="relative pb-6">
        <div className="w-full h-[400px] flex items-center justify-center">
          <svg
            ref={svgRef}
            viewBox="0 0 800 400"
            className="w-full h-full drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
          />
        </div>
        
        {/* Performance indicators with smooth transitions */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 transition-all duration-500">
            <div className="text-lg font-bold text-blue-600 transition-all duration-500">
              ${Math.max(...data.map(d => d.revenue)).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Peak Revenue</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 transition-all duration-500">
            <div className="text-lg font-bold text-green-600 transition-all duration-500">
              ${Math.round(totalRevenue / data.length).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Average</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 transition-all duration-500">
            <div className="text-lg font-bold text-purple-600 transition-all duration-500">
              {data.length}
            </div>
            <div className="text-xs text-muted-foreground">Data Points</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
