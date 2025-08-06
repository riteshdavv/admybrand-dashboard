"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react'
import { ErrorBoundary, ChartErrorFallback } from '@/components/ui/error-boundary'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { UserGrowthChart } from '@/components/charts/user-growth-chart'
import { ConversionChart } from '@/components/charts/conversion-chart'

type ChartType = 'line' | 'bar' | 'pie'

interface SmartChartWrapperProps {
  title: string
  description?: string
  data: any
  defaultType?: ChartType
  availableTypes?: ChartType[]
  className?: string
}

export function SmartChartWrapper({ 
  title, 
  description, 
  data, 
  defaultType = 'line',
  availableTypes = ['line', 'bar', 'pie'],
  className 
}: SmartChartWrapperProps) {
  const [chartType, setChartType] = useState<ChartType>(defaultType)

  const chartIcons = {
    line: LineChart,
    bar: BarChart3,
    pie: PieChart
  }

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return <RevenueChart data={data} />
      case 'bar':
        return <UserGrowthChart data={data} />
      case 'pie':
        return <ConversionChart data={data} />
      default:
        return <RevenueChart data={data} />
    }
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex gap-1">
            {availableTypes.map((type) => {
              const Icon = chartIcons[type]
              return (
                <Button
                  key={type}
                  variant={chartType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType(type)}
                  className="transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              )
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ErrorBoundary fallback={ChartErrorFallback}>
          {renderChart()}
        </ErrorBoundary>
      </CardContent>
    </Card>
  )
}
