"use client"

import { useRef, useEffect } from 'react'

interface MiniSparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  className?: string
}

export function MiniSparkline({ 
  data, 
  width = 60, 
  height = 20, 
  color = '#3b82f6',
  className 
}: MiniSparklineProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = svgRef.current
    svg.innerHTML = ''

    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    }).join(' ')

    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
    polyline.setAttribute('points', points)
    polyline.setAttribute('fill', 'none')
    polyline.setAttribute('stroke', color)
    polyline.setAttribute('stroke-width', '1.5')
    polyline.setAttribute('stroke-linecap', 'round')
    polyline.setAttribute('stroke-linejoin', 'round')

    svg.appendChild(polyline)
  }, [data, width, height, color])

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className={`transition-all duration-200 ${className}`}
      viewBox={`0 0 ${width} ${height}`}
    />
  )
}
