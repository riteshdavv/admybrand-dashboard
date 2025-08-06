"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react'

interface SimpleChartProps {
  title: string
  data: any[]
  type: 'bar' | 'line' | 'pie'
}

export function SimpleChartFallback({ title, data, type }: SimpleChartProps) {
  const getIcon = () => {
    switch (type) {
      case 'bar': return <BarChart3 className="h-5 w-5 text-blue-500" />
      case 'line': return <TrendingUp className="h-5 w-5 text-green-500" />
      case 'pie': return <Target className="h-5 w-5 text-purple-500" />
      default: return <BarChart3 className="h-5 w-5" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          {title}
        </CardTitle>
        <CardDescription>
          Data visualization with {data.length} data points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/25">
          <div className="text-center space-y-2">
            <div className="text-4xl">📊</div>
            <div className="text-lg font-semibold">{title}</div>
            <div className="text-sm text-muted-foreground">
              Chart with {data.length} data points
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              {data.slice(0, 4).map((item, index) => (
                <div key={index} className="p-2 bg-background rounded border">
                  <div className="font-medium">
                    {typeof item === 'object' ? Object.keys(item)[0] : `Item ${index + 1}`}
                  </div>
                  <div className="text-muted-foreground">
                    {typeof item === 'object' ? Object.values(item)[1] : item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
