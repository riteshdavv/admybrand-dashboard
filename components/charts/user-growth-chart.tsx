"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, UserCheck, Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface UserGrowthChartProps {
  data: Array<{
    month: string
    newUsers: number
    returningUsers: number
  }>
  filters?: any
}

export function UserGrowthChart({ data, filters }: UserGrowthChartProps) {
  const [activeMetric, setActiveMetric] = useState<'all' | 'new' | 'returning'>('all')
  const svgRef = useRef<SVGSVGElement>(null)
  const [previousData, setPreviousData] = useState(data)
  const [hoveredBar, setHoveredBar] = useState<{ index: number; type: 'new' | 'returning' | null }>({ index: -1, type: null })
  const animationRef = useRef<number>()

  const totalNewUsers = data.reduce((sum, item) => sum + item.newUsers, 0)
  const totalReturningUsers = data.reduce((sum, item) => sum + item.returningUsers, 0)

  // Filter data based on applied filters
  const filteredData = data.filter(item => {
    if (!filters) return true
    
    // Apply any additional filtering logic based on filters
    // For now, we'll just return all data as the main filtering happens at the data source level
    return true
  })

  // Animation function for smooth bar transitions
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
        newUsers: fromData[index] 
          ? fromData[index].newUsers + (item.newUsers - fromData[index].newUsers) * easedProgress
          : item.newUsers * easedProgress,
        returningUsers: fromData[index] 
          ? fromData[index].returningUsers + (item.returningUsers - fromData[index].returningUsers) * easedProgress
          : item.returningUsers * easedProgress
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
    const margin = { top: 60, right: 40, bottom: 60, left: 80 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // Clear previous content
    svg.innerHTML = ''

    // Filter data based on active metric
    const filteredChartData = chartData.map(item => ({
      ...item,
      newUsers: activeMetric === 'returning' ? 0 : item.newUsers,
      returningUsers: activeMetric === 'new' ? 0 : item.returningUsers,
    }))

    const maxValue = Math.max(...filteredChartData.map(d => d.newUsers + d.returningUsers))

    // Create main group
    const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    mainGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`)
    svg.appendChild(mainGroup)

    // Create gradient definitions
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    
    // New users gradient
    const newUsersGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
    newUsersGradient.setAttribute('id', 'newUsersGradient')
    newUsersGradient.setAttribute('x1', '0%')
    newUsersGradient.setAttribute('y1', '0%')
    newUsersGradient.setAttribute('x2', '0%')
    newUsersGradient.setAttribute('y2', '100%')
    
    const newStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    newStop1.setAttribute('offset', '0%')
    newStop1.setAttribute('stop-color', '#10b981')
    newStop1.setAttribute('stop-opacity', animationProgress.toString())
    
    const newStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    newStop2.setAttribute('offset', '100%')
    newStop2.setAttribute('stop-color', '#059669')
    newStop2.setAttribute('stop-opacity', (0.8 * animationProgress).toString())
    
    newUsersGradient.appendChild(newStop1)
    newUsersGradient.appendChild(newStop2)
    defs.appendChild(newUsersGradient)

    // Returning users gradient
    const returningGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
    returningGradient.setAttribute('id', 'returningGradient')
    returningGradient.setAttribute('x1', '0%')
    returningGradient.setAttribute('y1', '0%')
    returningGradient.setAttribute('x2', '0%')
    returningGradient.setAttribute('y2', '100%')
    
    const retStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    retStop1.setAttribute('offset', '0%')
    retStop1.setAttribute('stop-color', '#3b82f6')
    retStop1.setAttribute('stop-opacity', animationProgress.toString())
    
    const retStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    retStop2.setAttribute('offset', '100%')
    retStop2.setAttribute('stop-color', '#1d4ed8')
    retStop2.setAttribute('stop-opacity', (0.8 * animationProgress).toString())
    
    returningGradient.appendChild(retStop1)
    returningGradient.appendChild(retStop2)
    defs.appendChild(returningGradient)

    // Glow filter
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
    filter.setAttribute('id', 'barGlow')
    
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur')
    feGaussianBlur.setAttribute('stdDeviation', '2')
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

    // Create animated background grid
    const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    for (let i = 0; i <= 5; i++) {
      const y = (chartHeight / 5) * i
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', '0')
      line.setAttribute('y1', y.toString())
      line.setAttribute('x2', chartWidth.toString())
      line.setAttribute('y2', y.toString())
      line.setAttribute('stroke', '#e5e7eb')
      line.setAttribute('stroke-width', '1')
      line.setAttribute('stroke-dasharray', '3,3')
      line.setAttribute('opacity', (0.5 * animationProgress).toString())
      
      gridGroup.appendChild(line)
    }
    mainGroup.appendChild(gridGroup)

    // Create bars with dynamic heights and hover tooltips
    const barWidth = chartWidth / chartData.length * 0.7
    const barSpacing = chartWidth / chartData.length

    filteredChartData.forEach((point, index) => {
      const x = barSpacing * index + (barSpacing - barWidth) / 2
      
      // New users bar
      if (activeMetric !== 'returning' && point.newUsers > 0) {
        const barHeight = (point.newUsers / maxValue) * chartHeight
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('x', x.toString())
        rect.setAttribute('y', (chartHeight - barHeight).toString())
        rect.setAttribute('width', (activeMetric === 'all' ? barWidth / 2 : barWidth).toString())
        rect.setAttribute('height', barHeight.toString())
        rect.setAttribute('fill', 'url(#newUsersGradient)')
        rect.setAttribute('filter', 'url(#barGlow)')
        rect.setAttribute('rx', '4')
        rect.setAttribute('class', 'bar-new')
        rect.setAttribute('style', 'cursor: pointer;')
        
        // Hover effects with value display at top
        rect.addEventListener('mouseenter', () => {
          setHoveredBar({ index, type: 'new' })
          rect.setAttribute('filter', 'url(#barGlow) brightness(1.1)')
          
          // Create tooltip at the top of the bar
          const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g')
          tooltip.setAttribute('id', `tooltip-new-${index}`)
          
          const tooltipBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
          const tooltipX = x + (activeMetric === 'all' ? barWidth / 4 : barWidth / 2) - 30
          const tooltipY = chartHeight - barHeight - 35
          
          tooltipBg.setAttribute('x', tooltipX.toString())
          tooltipBg.setAttribute('y', tooltipY.toString())
          tooltipBg.setAttribute('width', '60')
          tooltipBg.setAttribute('height', '25')
          tooltipBg.setAttribute('fill', '#10b981')
          tooltipBg.setAttribute('rx', '4')
          tooltipBg.setAttribute('opacity', '0.9')
          
          const tooltipText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          tooltipText.setAttribute('x', (tooltipX + 30).toString())
          tooltipText.setAttribute('y', (tooltipY + 16).toString())
          tooltipText.setAttribute('text-anchor', 'middle')
          tooltipText.setAttribute('fill', '#ffffff')
          tooltipText.setAttribute('font-size', '12')
          tooltipText.setAttribute('font-weight', 'bold')
          tooltipText.textContent = Math.round(point.newUsers).toLocaleString()
          
          tooltip.appendChild(tooltipBg)
          tooltip.appendChild(tooltipText)
          mainGroup.appendChild(tooltip)
        })
        
        rect.addEventListener('mouseleave', () => {
          setHoveredBar({ index: -1, type: null })
          rect.setAttribute('filter', 'url(#barGlow)')
          
          const tooltip = document.getElementById(`tooltip-new-${index}`)
          if (tooltip) tooltip.remove()
        })
        
        mainGroup.appendChild(rect)
      }
      
      // Returning users bar
      if (activeMetric !== 'new' && point.returningUsers > 0) {
        const barHeight = (point.returningUsers / maxValue) * chartHeight
        const xOffset = activeMetric === 'all' ? barWidth / 2 : 0
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('x', (x + xOffset).toString())
        rect.setAttribute('y', (chartHeight - barHeight).toString())
        rect.setAttribute('width', (activeMetric === 'all' ? barWidth / 2 : barWidth).toString())
        rect.setAttribute('height', barHeight.toString())
        rect.setAttribute('fill', 'url(#returningGradient)')
        rect.setAttribute('filter', 'url(#barGlow)')
        rect.setAttribute('rx', '4')
        rect.setAttribute('class', 'bar-returning')
        rect.setAttribute('style', 'cursor: pointer;')
        
        // Hover effects with value display at top
        rect.addEventListener('mouseenter', () => {
          setHoveredBar({ index, type: 'returning' })
          rect.setAttribute('filter', 'url(#barGlow) brightness(1.1)')
          
          // Create tooltip at the top of the bar
          const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g')
          tooltip.setAttribute('id', `tooltip-returning-${index}`)
          
          const tooltipBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
          const tooltipX = x + xOffset + (activeMetric === 'all' ? barWidth / 4 : barWidth / 2) - 30
          const tooltipY = chartHeight - barHeight - 35
          
          tooltipBg.setAttribute('x', tooltipX.toString())
          tooltipBg.setAttribute('y', tooltipY.toString())
          tooltipBg.setAttribute('width', '60')
          tooltipBg.setAttribute('height', '25')
          tooltipBg.setAttribute('fill', '#3b82f6')
          tooltipBg.setAttribute('rx', '4')
          tooltipBg.setAttribute('opacity', '0.9')
          
          const tooltipText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          tooltipText.setAttribute('x', (tooltipX + 30).toString())
          tooltipText.setAttribute('y', (tooltipY + 16).toString())
          tooltipText.setAttribute('text-anchor', 'middle')
          tooltipText.setAttribute('fill', '#ffffff')
          tooltipText.setAttribute('font-size', '12')
          tooltipText.setAttribute('font-weight', 'bold')
          tooltipText.textContent = Math.round(point.returningUsers).toLocaleString()
          
          tooltip.appendChild(tooltipBg)
          tooltip.appendChild(tooltipText)
          mainGroup.appendChild(tooltip)
        })
        
        rect.addEventListener('mouseleave', () => {
          setHoveredBar({ index: -1, type: null })
          rect.setAttribute('filter', 'url(#barGlow)')
          
          const tooltip = document.getElementById(`tooltip-returning-${index}`)
          if (tooltip) tooltip.remove()
        })
        
        mainGroup.appendChild(rect)
      }
    })

    // Add axis labels with animation
    const xAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    chartData.forEach((point, index) => {
      const x = barSpacing * index + barSpacing / 2
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', x.toString())
      text.setAttribute('y', (chartHeight + 25).toString())
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('fill', '#6b7280')
      text.setAttribute('font-size', '12')
      text.setAttribute('font-weight', '500')
      text.setAttribute('opacity', animationProgress.toString())
      text.textContent = point.month.slice(0, 3)
      
      xAxisGroup.appendChild(text)
    })
    mainGroup.appendChild(xAxisGroup)

    // Y-axis labels
    const yAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue / 5) * (5 - i)
      const y = (chartHeight / 5) * i
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', '-15')
      text.setAttribute('y', (y + 4).toString())
      text.setAttribute('text-anchor', 'end')
      text.setAttribute('fill', '#6b7280')
      text.setAttribute('font-size', '12')
      text.setAttribute('font-weight', '500')
      text.setAttribute('opacity', animationProgress.toString())
      text.textContent = `${(value / 1000).toFixed(1)}k`
      
      yAxisGroup.appendChild(text)
    }
    mainGroup.appendChild(yAxisGroup)
  }

  // Effect to handle data changes with smooth animation
  useEffect(() => {
    if (JSON.stringify(previousData) !== JSON.stringify(filteredData)) {
      // Cancel any ongoing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      
      // Start animation from previous data to new data
      animateToNewData(previousData, filteredData, 1200)
      setPreviousData(filteredData)
    } else {
      // Initial render
      drawChart(filteredData)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [filteredData, activeMetric])

  return (
    <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl border-0 bg-gradient-to-br from-white via-green-50/30 to-blue-50/50 dark:from-gray-900 dark:via-green-950/30 dark:to-blue-950/50">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 animate-pulse" />
      </div>
      
      <CardHeader className="relative pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                User Growth Analytics
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                  <Zap className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground font-medium">
                User acquisition & retention • Total: 
                <span className="font-bold text-blue-600 ml-1 transition-all duration-500">
                  {(totalNewUsers + totalReturningUsers).toLocaleString()}
                </span>
                {filters && Object.keys(filters).length > 0 && (
                  <span className="text-green-600 ml-2">• Filtered</span>
                )}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeMetric === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveMetric('all')}
              className={`transition-all duration-300 ${
                activeMetric === 'all' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105' 
                  : 'hover:scale-105'
              }`}
            >
              <Users className="h-3 w-3 mr-1" />
              All Users
            </Button>
            <Button
              variant={activeMetric === 'new' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveMetric('new')}
              className={`transition-all duration-300 ${
                activeMetric === 'new' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105' 
                  : 'hover:scale-105'
              }`}
            >
              <UserPlus className="h-3 w-3 mr-1" />
              New Users
            </Button>
            <Button
              variant={activeMetric === 'returning' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveMetric('returning')}
              className={`transition-all duration-300 ${
                activeMetric === 'returning' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105' 
                  : 'hover:scale-105'
              }`}
            >
              <UserCheck className="h-3 w-3 mr-1" />
              Returning
            </Button>
          </div>
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
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-200/50 transition-all duration-500">
            <div className="text-2xl font-bold text-green-600 mb-1 transition-all duration-500">
              {totalNewUsers.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground font-medium">New Users</div>
            <div className="text-xs text-green-600 font-semibold mt-1">
              +{((totalNewUsers / (totalNewUsers + totalReturningUsers)) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200/50 transition-all duration-500">
            <div className="text-2xl font-bold text-blue-600 mb-1 transition-all duration-500">
              {totalReturningUsers.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Returning Users</div>
            <div className="text-xs text-blue-600 font-semibold mt-1">
              +{((totalReturningUsers / (totalNewUsers + totalReturningUsers)) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
