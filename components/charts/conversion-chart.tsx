"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, TrendingUp, Sparkles, Eye } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ConversionChartProps {
  data: Array<{
    source: string
    conversions: number
    fill: string
  }>
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function ConversionChart({ data }: ConversionChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)
  const [previousData, setPreviousData] = useState(data)
  const animationRef = useRef<number>()

  const totalConversions = data.reduce((sum, item) => sum + item.conversions, 0)
  const topSource = data.reduce((prev, current) => 
    prev.conversions > current.conversions ? prev : current
  )

  // Animation function for smooth pie transitions
  const animateToNewData = (fromData: typeof data, toData: typeof data, duration: number = 1000) => {
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
      const easedProgress = easeInOutCubic(progress)
      
      // Interpolate between old and new data
      const interpolatedData = toData.map((item, index) => {
        const fromItem = fromData.find(d => d.source === item.source) || { conversions: 0 }
        return {
          source: item.source,
          conversions: fromItem.conversions + (item.conversions - fromItem.conversions) * easedProgress,
          fill: item.fill
        }
      })
      
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
    const width = 400
    const height = 350
    const centerX = width / 2
    const centerY = height / 2 - 20
    const outerRadius = Math.min(width, height) / 3
    const innerRadius = outerRadius * 0.5

    // Clear previous content
    svg.innerHTML = ''

    const currentTotal = chartData.reduce((sum, item) => sum + item.conversions, 0)

    // Create gradient definitions
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    
    // Create gradients for each segment
    chartData.forEach((item, index) => {
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient')
      gradient.setAttribute('id', `gradient-${index}`)
      gradient.setAttribute('cx', '50%')
      gradient.setAttribute('cy', '50%')
      gradient.setAttribute('r', '50%')
      
      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
      stop1.setAttribute('offset', '0%')
      stop1.setAttribute('stop-color', COLORS[index % COLORS.length])
      stop1.setAttribute('stop-opacity', animationProgress.toString())
      
      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
      stop2.setAttribute('offset', '100%')
      stop2.setAttribute('stop-color', COLORS[index % COLORS.length])
      stop2.setAttribute('stop-opacity', (0.7 * animationProgress).toString())
      
      gradient.appendChild(stop1)
      gradient.appendChild(stop2)
      defs.appendChild(gradient)
    })

    // Glow filter
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
    filter.setAttribute('id', 'pieGlow')
    
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

    let currentAngle = -Math.PI / 2 // Start from top

    // Create animated pie segments
    chartData.forEach((item, index) => {
      const segmentAngle = (item.conversions / currentTotal) * 2 * Math.PI
      const midAngle = currentAngle + segmentAngle / 2
      
      // Create path for donut segment
      const x1 = centerX + innerRadius * Math.cos(currentAngle)
      const y1 = centerY + innerRadius * Math.sin(currentAngle)
      const x2 = centerX + outerRadius * Math.cos(currentAngle)
      const y2 = centerY + outerRadius * Math.sin(currentAngle)
      
      const x3 = centerX + outerRadius * Math.cos(currentAngle + segmentAngle)
      const y3 = centerY + outerRadius * Math.sin(currentAngle + segmentAngle)
      const x4 = centerX + innerRadius * Math.cos(currentAngle + segmentAngle)
      const y4 = centerY + innerRadius * Math.sin(currentAngle + segmentAngle)
      
      const largeArcFlag = segmentAngle > Math.PI ? 1 : 0
      
      const pathData = [
        `M ${x1} ${y1}`,
        `L ${x2} ${y2}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
        `L ${x4} ${y4}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
        'Z'
      ].join(' ')
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', pathData)
      path.setAttribute('fill', `url(#gradient-${index})`)
      path.setAttribute('stroke', '#ffffff')
      path.setAttribute('stroke-width', '2')
      path.setAttribute('filter', 'url(#pieGlow)')
      path.setAttribute('opacity', animationProgress.toString())
      path.setAttribute('class', 'pie-segment')
      path.setAttribute('style', 'cursor: pointer; transition: all 0.3s ease;')
      
      // Hover effects
      path.addEventListener('mouseenter', () => {
        setHoveredSegment(item.source)
        path.setAttribute('transform', `translate(${Math.cos(midAngle) * 5}, ${Math.sin(midAngle) * 5})`)
        path.setAttribute('filter', 'url(#pieGlow) brightness(1.2)')
      })
      
      path.addEventListener('mouseleave', () => {
        setHoveredSegment(null)
        path.setAttribute('transform', 'translate(0, 0)')
        path.setAttribute('filter', 'url(#pieGlow)')
      })
      
      svg.appendChild(path)
      
      // Add percentage labels with animation
      const labelRadius = (outerRadius + innerRadius) / 2
      const labelX = centerX + labelRadius * Math.cos(midAngle)
      const labelY = centerY + labelRadius * Math.sin(midAngle)
      
      const percentage = ((item.conversions / currentTotal) * 100).toFixed(1)
      
      if (parseFloat(percentage) > 5) { // Only show label if segment is large enough
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.setAttribute('x', labelX.toString())
        text.setAttribute('y', labelY.toString())
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute('dominant-baseline', 'middle')
        text.setAttribute('fill', '#ffffff')
        text.setAttribute('font-size', '12')
        text.setAttribute('font-weight', 'bold')
        text.setAttribute('opacity', animationProgress.toString())
        text.textContent = `${percentage}%`
        
        svg.appendChild(text)
      }
      
      currentAngle += segmentAngle
    })

    // Add center content
    const centerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    
    // Center circle background
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    centerCircle.setAttribute('cx', centerX.toString())
    centerCircle.setAttribute('cy', centerY.toString())
    centerCircle.setAttribute('r', (innerRadius - 5).toString())
    centerCircle.setAttribute('fill', '#f8fafc')
    centerCircle.setAttribute('stroke', '#e2e8f0')
    centerCircle.setAttribute('stroke-width', '2')
    centerCircle.setAttribute('opacity', animationProgress.toString())
    
    centerGroup.appendChild(centerCircle)
    
    // Center text
    const centerText1 = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    centerText1.setAttribute('x', centerX.toString())
    centerText1.setAttribute('y', (centerY - 8).toString())
    centerText1.setAttribute('text-anchor', 'middle')
    centerText1.setAttribute('fill', '#374151')
    centerText1.setAttribute('font-size', '14')
    centerText1.setAttribute('font-weight', 'bold')
    centerText1.setAttribute('opacity', animationProgress.toString())
    centerText1.textContent = 'Total'
    
    const centerText2 = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    centerText2.setAttribute('x', centerX.toString())
    centerText2.setAttribute('y', (centerY + 8).toString())
    centerText2.setAttribute('text-anchor', 'middle')
    centerText2.setAttribute('fill', '#6366f1')
    centerText2.setAttribute('font-size', '16')
    centerText2.setAttribute('font-weight', 'bold')
    centerText2.setAttribute('opacity', animationProgress.toString())
    centerText2.textContent = Math.round(currentTotal).toLocaleString()
    
    centerGroup.appendChild(centerText1)
    centerGroup.appendChild(centerText2)
    svg.appendChild(centerGroup)
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
    <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl border-0 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/50 dark:from-gray-900 dark:via-purple-950/30 dark:to-pink-950/50">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-pulse" />
      </div>
      
      <CardHeader className="relative pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              Conversion Sources
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transition-all duration-500">
                <Sparkles className="h-3 w-3 mr-1" />
                {totalConversions.toLocaleString()}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground font-medium">
              Traffic source breakdown • Top performer: 
              <span className="font-bold text-purple-600 ml-1 transition-all duration-500">
                {topSource.source} ({((topSource.conversions / totalConversions) * 100).toFixed(1)}%)
              </span>
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="opacity-60 hover:opacity-100 transition-opacity">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="relative pb-6">
        <div className="w-full h-[350px] flex items-center justify-center">
          <svg
            ref={svgRef}
            viewBox="0 0 400 350"
            className="w-full h-full drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
          />
        </div>
        
        {/* Interactive Legend with smooth transitions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {data.map((item, index) => (
            <div 
              key={item.source}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 cursor-pointer border ${
                hoveredSegment === item.source 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 scale-105 shadow-lg border-purple-200' 
                  : 'hover:bg-muted/50 border-transparent'
              }`}
              onMouseEnter={() => setHoveredSegment(item.source)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div className="relative">
                <div 
                  className="h-4 w-4 rounded-full shadow-lg transition-all duration-300" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                {hoveredSegment === item.source && (
                  <div className="absolute inset-0 rounded-full animate-ping" 
                       style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold capitalize truncate">
                  {item.source}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="transition-all duration-500">{item.conversions.toLocaleString()}</span>
                  <span className="font-semibold text-purple-600 transition-all duration-500">
                    {((item.conversions / totalConversions) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
