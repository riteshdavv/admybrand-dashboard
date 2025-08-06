"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Filter, X, RotateCcw, CheckCircle } from 'lucide-react'
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface FilterState {
  dateRange: {
    from: Date
    to: Date
  }
  metrics: string[]
  sources: string[]
  status: string
}

interface AdvancedFiltersProps {
  dateRange: {
    from: Date
    to: Date
  }
  onDateRangeChange: (dateRange: { from: Date; to: Date }) => void
  onFiltersChange: (filters: FilterState) => void
}

export function AdvancedFilters({ dateRange, onDateRangeChange, onFiltersChange }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [tempDateRange, setTempDateRange] = useState(dateRange)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  
  // Applied filters state for display
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    dateRange,
    metrics: [],
    sources: [],
    status: "all"
  })

  const metrics = ["Revenue", "Users", "Conversions", "CTR", "Cost"]
  const sources = ["Organic", "Paid", "Social", "Email", "Direct"]
  const statuses = ["Active", "Paused", "Completed"]

  const handleApplyFilters = () => {
    const newFilters: FilterState = {
      dateRange: tempDateRange,
      metrics: selectedMetrics,
      sources: selectedSources,
      status: selectedStatus
    }
    
    setAppliedFilters(newFilters)
    onDateRangeChange(tempDateRange)
    onFiltersChange(newFilters)
    setIsExpanded(false)
  }

  const handleResetFilters = () => {
    const defaultRange = {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    }
    
    const resetFilters: FilterState = {
      dateRange: defaultRange,
      metrics: [],
      sources: [],
      status: "all"
    }
    
    setTempDateRange(defaultRange)
    setSelectedMetrics([])
    setSelectedSources([])
    setSelectedStatus("all")
    setAppliedFilters(resetFilters)
    onDateRangeChange(defaultRange)
    onFiltersChange(resetFilters)
  }

  const removeAppliedFilter = (type: string, value?: string) => {
    let newFilters = { ...appliedFilters }
    
    switch (type) {
      case 'metric':
        newFilters.metrics = newFilters.metrics.filter(m => m !== value)
        setSelectedMetrics(newFilters.metrics)
        break
      case 'source':
        newFilters.sources = newFilters.sources.filter(s => s !== value)
        setSelectedSources(newFilters.sources)
        break
      case 'status':
        newFilters.status = "all"
        setSelectedStatus("all")
        break
    }
    
    setAppliedFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    )
  }

  const toggleSource = (source: string) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    )
  }

  const activeFiltersCount = selectedMetrics.length + selectedSources.length + (selectedStatus && selectedStatus !== "all" ? 1 : 0)
  const appliedFiltersCount = appliedFilters.metrics.length + appliedFilters.sources.length + (appliedFilters.status !== "all" ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Applied Filters Display */}
      {appliedFiltersCount > 0 && (
        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              Active Filters ({appliedFiltersCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {/* Date Range Filter */}
              <Badge 
                variant="secondary" 
                className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1"
              >
                📅 {format(appliedFilters.dateRange.from, "MMM dd")} - {format(appliedFilters.dateRange.to, "MMM dd")}
              </Badge>
              
              {/* Metrics Filters */}
              {appliedFilters.metrics.map((metric) => (
                <Badge 
                  key={metric}
                  variant="secondary"
                  className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-3 py-1 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800"
                  onClick={() => removeAppliedFilter('metric', metric)}
                >
                  📊 {metric}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
              
              {/* Sources Filters */}
              {appliedFilters.sources.map((source) => (
                <Badge 
                  key={source}
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-3 py-1 cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-800"
                  onClick={() => removeAppliedFilter('source', source)}
                >
                  🔗 {source}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
              
              {/* Status Filter */}
              {appliedFilters.status !== "all" && (
                <Badge 
                  variant="secondary"
                  className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-3 py-1 cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800"
                  onClick={() => removeAppliedFilter('status')}
                >
                  🎯 {appliedFilters.status.charAt(0).toUpperCase() + appliedFilters.status.slice(1)}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              
              {/* Clear All Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Configuration */}
      <Card className="transition-all duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Configure Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount} pending
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Collapse" : "Expand"}
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Date Range Picker */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !tempDateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempDateRange?.from ? (
                        tempDateRange.to ? (
                          <>
                            {format(tempDateRange.from, "LLL dd, y")} -{" "}
                            {format(tempDateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(tempDateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={tempDateRange?.from}
                      selected={tempDateRange}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          setTempDateRange({ from: range.from, to: range.to })
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Quick Ranges</Label>
                <div className="flex gap-2">
                  {[
                    { label: "7D", days: 7 },
                    { label: "30D", days: 30 },
                    { label: "90D", days: 90 }
                  ].map(({ label, days }) => (
                    <Button
                      key={label}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newRange = {
                          from: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
                          to: new Date()
                        }
                        setTempDateRange(newRange)
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleApplyFilters} 
                className="ml-auto bg-green-600 hover:bg-green-700 text-white"
                disabled={activeFiltersCount === 0 && JSON.stringify(tempDateRange) === JSON.stringify(appliedFilters.dateRange)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>

            {/* Expanded Filters */}
            {isExpanded && (
              <div className="grid gap-6 md:grid-cols-3 pt-4 border-t">
                {/* Metrics Filter */}
                <div className="space-y-3">
                  <Label>Metrics</Label>
                  <div className="flex flex-wrap gap-2">
                    {metrics.map((metric) => (
                      <Badge
                        key={metric}
                        variant={selectedMetrics.includes(metric) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80 transition-all duration-200"
                        onClick={() => toggleMetric(metric)}
                      >
                        {metric}
                        {selectedMetrics.includes(metric) && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Sources Filter */}
                <div className="space-y-3">
                  <Label>Traffic Sources</Label>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((source) => (
                      <Badge
                        key={source}
                        variant={selectedSources.includes(source) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80 transition-all duration-200"
                        onClick={() => toggleSource(source)}
                      >
                        {source}
                        {selectedSources.includes(source) && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-3">
                  <Label>Campaign Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status.toLowerCase()}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
