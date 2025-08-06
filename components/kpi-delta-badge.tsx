"use client"

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface KPIDeltaBadgeProps {
  value: number
  label?: string
  showIcon?: boolean
  className?: string
}

export function KPIDeltaBadge({ value, label, showIcon = true, className }: KPIDeltaBadgeProps) {
  const isPositive = value > 0
  const isNeutral = value === 0
  
  const getIcon = () => {
    if (!showIcon) return null
    if (isNeutral) return <Minus className="h-3 w-3" />
    return isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
  }

  const getVariant = () => {
    if (isNeutral) return 'secondary'
    return 'default'
  }

  const getColorClasses = () => {
    if (isNeutral) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    if (isPositive) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  return (
    <Badge 
      variant={getVariant()}
      className={cn(
        'flex items-center gap-1 font-semibold transition-all duration-200 hover:scale-105',
        getColorClasses(),
        className
      )}
    >
      {getIcon()}
      <span>
        {isPositive && '+'}
        {value.toFixed(1)}%
      </span>
      {label && <span className="ml-1 opacity-75">{label}</span>}
    </Badge>
  )
}
