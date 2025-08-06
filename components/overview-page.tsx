"use client"

import { useState, useEffect } from "react"
import { MetricsCards } from "@/components/metrics-cards"
import { RevenueChart } from "@/components/charts/revenue-chart"
import { UserGrowthChart } from "@/components/charts/user-growth-chart"
import { ConversionChart } from "@/components/charts/conversion-chart"
import { DataTable } from "@/components/data-table"
import { AdvancedFilters } from "@/components/advanced-filters"
import { ExportButtons } from "@/components/export-buttons"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { generateMockData } from "@/lib/mock-data"
import { Wifi, WifiOff, RefreshCw, Sparkles } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface FilterState {
  dateRange: {
    from: Date
    to: Date
  }
  metrics: string[]
  sources: string[]
  status: string
}

export function OverviewPage() {
  const [data, setData] = useState(generateMockData())
  const [filteredData, setFilteredData] = useState(generateMockData())
  const [isLoading, setIsLoading] = useState(true)
  const [isRealTimeActive, setIsRealTimeActive] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    },
    metrics: [],
    sources: [],
    status: "all"
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isRealTimeActive) return
    const interval = setInterval(() => {
      const newData = generateMockData()
      setData(newData)
      applyFiltersToData(newData, appliedFilters)
      setLastUpdated(new Date())
    }, 15000)
    return () => clearInterval(interval)
  }, [isRealTimeActive, appliedFilters])

  const applyFiltersToData = (sourceData: any, filters: FilterState) => {
    let filtered = { ...sourceData }
    
    // Apply date range filter (simulate filtering)
    // In a real app, this would filter based on the actual date range
    
    // Apply metrics filter
    if (filters.metrics.length > 0) {
      // Simulate filtering - in reality, you'd filter the actual data
      // For demo purposes, we'll just modify the data slightly to show the effect
      filtered.metrics = {
        ...filtered.metrics,
        revenue: filtered.metrics.revenue * 0.8,
        users: filtered.metrics.users * 0.9
      }
    }
    
    // Apply sources filter
    if (filters.sources.length > 0) {
      filtered.conversionData = filtered.conversionData.filter((item: any) => 
        filters.sources.map(s => s.toLowerCase()).includes(item.source)
      )
    }
    
    // Apply status filter
    if (filters.status !== "all") {
      filtered.tableData = filtered.tableData.filter((item: any) => 
        item.status === filters.status
      )
    }
    
    setFilteredData(filtered)
  }

  const handleTableDataUpdate = (newTableData: any[]) => {
    const updatedData = { ...data, tableData: newTableData }
    setData(updatedData)
    applyFiltersToData(updatedData, appliedFilters)
  }

  const handleDateRangeChange = (newDateRange: { from: Date; to: Date }) => {
    const newFilters = { ...appliedFilters, dateRange: newDateRange }
    setAppliedFilters(newFilters)
    setIsLoading(true)
    setTimeout(() => {
      const newData = generateMockData()
      setData(newData)
      applyFiltersToData(newData, newFilters)
      setIsLoading(false)
    }, 1000)
  }

  const handleFiltersChange = (filters: FilterState) => {
    setAppliedFilters(filters)
    applyFiltersToData(data, filters)
  }

  const toggleRealTime = () => {
    setIsRealTimeActive(!isRealTimeActive)
  }

  const handleManualRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      const newData = generateMockData()
      setData(newData)
      applyFiltersToData(newData, appliedFilters)
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 1000)
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="w-full space-y-8 p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/50 min-h-screen">
      {/* Enhanced Header with Glassmorphism Effect */}
      <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
        <div className="relative p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex items-center gap-4">
                <Button
                  onClick={toggleRealTime}
                  variant="outline"
                  size="sm"
                  className={`transition-all duration-300 hover:scale-105 ${
                    isRealTimeActive 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400 shadow-lg' 
                      : 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-red-400 shadow-lg'
                  }`}
                >
                  {isRealTimeActive ? (
                    <Wifi className="h-4 w-4 mr-2" />
                  ) : (
                    <WifiOff className="h-4 w-4 mr-2" />
                  )}
                  {isRealTimeActive ? "Live Updates" : "Updates Paused"}
                </Button>
                
                <Button
                  onClick={handleManualRefresh}
                  variant="ghost"
                  size="sm"
                  disabled={isRefreshing}
                  className="transition-all duration-300 hover:scale-105 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div className="w-full lg:w-auto">
              <ExportButtons data={filteredData} />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters with Enhanced Styling */}
      <div className="animate-in slide-in-from-top-4 duration-700 delay-100">
        <AdvancedFilters 
          dateRange={appliedFilters.dateRange}
          onDateRangeChange={handleDateRangeChange}
          onFiltersChange={handleFiltersChange}
        />
      </div>
      
      {/* Metrics Cards with Staggered Animation */}
      <div className="animate-in slide-in-from-left-4 duration-700 delay-200">
        <MetricsCards data={filteredData} />
      </div>
      
      {/* Charts Section with Premium Layout */}
      <div className="space-y-8">
        {/* First Row - Revenue & Conversion */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-700 delay-300">
          <div className="xl:col-span-2">
            <RevenueChart data={filteredData.revenueData} />
          </div>
          <div className="xl:col-span-1">
            <ConversionChart data={filteredData.conversionData} />
          </div>
        </div>

        {/* Second Row - User Growth & Data Table */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-700 delay-400">
          <div className="xl:col-span-2">
            <UserGrowthChart data={filteredData.userGrowthData} filters={appliedFilters} />
          </div>
          <div className="xl:col-span-1">
            <DataTable 
              data={filteredData.tableData} 
              onDataUpdate={handleTableDataUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
