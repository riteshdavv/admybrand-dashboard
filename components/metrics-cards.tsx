"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, DollarSign, Target, BarChart3 } from 'lucide-react'
import { cn } from "@/lib/utils"

interface MetricsCardsProps {
  data: {
    metrics: {
      revenue: number
      revenueChange: number
      users: number
      usersChange: number
      conversions: number
      conversionsChange: number
      growth: number
      growthChange: number
    }
  }
}

export function MetricsCards({ data }: MetricsCardsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const metrics = [
    {
      id: "revenue",
      title: "Total Revenue",
      value: `$${data.metrics.revenue.toLocaleString()}`,
      change: data.metrics.revenueChange,
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bgGradient: "from-green-500/10 to-emerald-500/10",
      borderColor: "border-green-200 dark:border-green-800"
    },
    {
      id: "users",
      title: "Active Users",
      value: data.metrics.users.toLocaleString(),
      change: data.metrics.usersChange,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
      id: "conversions",
      title: "Conversions",
      value: data.metrics.conversions.toLocaleString(),
      change: data.metrics.conversionsChange,
      icon: Target,
      color: "text-purple-600 dark:text-purple-400",
      bgGradient: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-200 dark:border-purple-800"
    },
    {
      id: "growth",
      title: "Growth Rate",
      value: `${data.metrics.growth}%`,
      change: data.metrics.growthChange,
      icon: BarChart3,
      color: "text-orange-600 dark:text-orange-400",
      bgGradient: "from-orange-500/10 to-red-500/10",
      borderColor: "border-orange-200 dark:border-orange-800"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card 
          key={metric.id} 
          className={cn(
            "group relative overflow-hidden transition-all duration-300 cursor-pointer border-0 shadow-lg",
            "hover:shadow-xl hover:scale-105 active:scale-95",
            `bg-gradient-to-br ${metric.bgGradient}`,
            hoveredCard === metric.id ? "ring-2 ring-primary/20" : ""
          )}
          onMouseEnter={() => setHoveredCard(metric.id)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
              {metric.title}
            </CardTitle>
            <metric.icon className={cn(
              "h-5 w-5 transition-all duration-300",
              metric.color,
              "group-hover:scale-110 group-hover:rotate-12"
            )} />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold mb-2 transition-all duration-300 group-hover:text-3xl">
              {metric.value}
            </div>
            <div className="flex items-center text-xs">
              <div className={cn(
                "flex items-center transition-all duration-300",
                metric.change > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {metric.change > 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3 transition-transform duration-300 group-hover:scale-125" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 transition-transform duration-300 group-hover:scale-125" />
                )}
                <span className="font-medium">
                  {metric.change > 0 ? "+" : ""}{metric.change}%
                </span>
              </div>
              <span className="ml-2 text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                from last month
              </span>
            </div>
            
            {/* Progress bar animation */}
            <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  `bg-gradient-to-r ${metric.bgGradient.replace('/10', '/50')}`
                )}
                style={{
                  width: hoveredCard === metric.id ? '100%' : '0%',
                }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
