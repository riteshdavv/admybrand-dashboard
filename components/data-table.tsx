"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, Plus, Sparkles, TrendingUp, TrendingDown } from 'lucide-react'

interface DataTableProps {
  data: Array<{
    id: string
    campaign: string
    clicks: number
    impressions: number
    ctr: number
    cost: number
    conversions: number
    status: "active" | "paused" | "completed"
  }>
  onDataUpdate?: (newData: any[]) => void
}

export function DataTable({ data, onDataUpdate }: DataTableProps) {
  const [tableData, setTableData] = useState(data)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [newRowIds, setNewRowIds] = useState<Set<string>>(new Set())
  const [isAddingRow, setIsAddingRow] = useState(false)
  const [pushingRows, setPushingRows] = useState(false)
  const itemsPerPage = 5

  // Update table data when prop changes and handle new items
  useEffect(() => {
    if (data.length !== tableData.length) {
      const newItems = data.filter(item => !tableData.find(existing => existing.id === item.id))
      
      if (newItems.length > 0) {
        // Trigger push animation for existing rows
        setPushingRows(true)
        
        setTimeout(() => {
          // Add new items to the beginning of the array
          const updatedData = [...newItems, ...tableData]
          setTableData(updatedData)
          
          // Track new items for highlighting
          const newIds = new Set(newItems.map(item => item.id))
          setNewRowIds(newIds)
          
          // Stop pushing animation
          setPushingRows(false)
          
          // Remove new row highlighting after animation
          setTimeout(() => {
            setNewRowIds(new Set())
          }, 2000)
          
          // Reset to first page to show new items
          setCurrentPage(1)
        }, 300)
      } else {
        setTableData(data)
      }
    }
  }, [data, tableData])

  // Simulate adding new data
  const addNewCampaign = () => {
    setIsAddingRow(true)
    
    // Trigger push animation for existing rows
    setPushingRows(true)
    
    setTimeout(() => {
      const campaigns = [
        "Flash Sale Campaign", "Weekend Special", "New Product Launch", "Customer Retention Drive",
        "Holiday Promotion", "Back to School", "Spring Collection", "Limited Time Offer",
        "VIP Member Exclusive", "Clearance Sale", "Brand Partnership", "Influencer Collab"
      ]
      
      const statuses = ["active", "paused", "completed"] as const
      const randomCampaign = campaigns[Math.floor(Math.random() * campaigns.length)]
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      
      const newItem = {
        id: `campaign-new-${Date.now()}`,
        campaign: randomCampaign,
        clicks: Math.floor(Math.random() * 10000) + 1000,
        impressions: Math.floor(Math.random() * 100000) + 10000,
        ctr: Math.random() * 5 + 1,
        cost: Math.floor(Math.random() * 5000) + 500,
        conversions: Math.floor(Math.random() * 100) + 10,
        status: randomStatus
      }
      
      const updatedData = [newItem, ...tableData]
      setTableData(updatedData)
      
      // Track new item for highlighting
      setNewRowIds(new Set([newItem.id]))
      
      // Stop pushing animation
      setPushingRows(false)
      setIsAddingRow(false)
      
      // Notify parent component
      if (onDataUpdate) {
        onDataUpdate(updatedData)
      }
      
      // Remove new row highlighting after animation
      setTimeout(() => {
        setNewRowIds(new Set())
      }, 2000)
      
      // Reset to first page to show new item
      setCurrentPage(1)
    }, 300)
  }

  const filteredData = tableData.filter(item =>
    item.campaign.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0
    
    const aValue = a[sortField as keyof typeof a]
    const bValue = b[sortField as keyof typeof b]
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      paused: "secondary", 
      completed: "outline"
    } as const

    const colors = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200",
      paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200",
      completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200"
    }

    return (
      <Badge 
        variant={variants[status as keyof typeof variants]}
        className={`${colors[status as keyof typeof colors]} transition-all duration-200 hover:scale-105`}
      >
        {status}
      </Badge>
    )
  }

  const getChangeIndicator = (value: number) => {
    const change = Math.floor(Math.random() * 20) - 10 // Random change for demo
    return change > 0 ? (
      <div className="flex items-center text-green-600 text-xs">
        <TrendingUp className="h-3 w-3 mr-1" />
        +{change}%
      </div>
    ) : (
      <div className="flex items-center text-red-600 text-xs">
        <TrendingDown className="h-3 w-3 mr-1" />
        {change}%
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        @keyframes slideInFromTop {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes pushDown {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
          100% {
            transform: translateY(0);
          }
        }
        
        @keyframes highlightNew {
          0% {
            background-color: rgba(34, 197, 94, 0.2);
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
          }
          100% {
            background-color: transparent;
            box-shadow: none;
          }
        }
        
        .new-row {
          animation: slideInFromTop 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards,
                     highlightNew 2s ease-out forwards;
          border-left: 4px solid #22c55e;
        }
        
        .push-down {
          animation: pushDown 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .dark .glassmorphism {
          background: rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
      
      <Card className="w-full group hover:shadow-xl transition-all duration-500 glassmorphism border-0 shadow-2xl">
        <CardHeader className="pb-4 bg-gradient-to-r from-white/50 to-blue-50/50 dark:from-gray-900/50 dark:to-blue-950/50 rounded-t-lg">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                  Campaign Performance
                  <Badge 
                    variant="secondary" 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg animate-pulse"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm font-medium">
                  Real-time campaign analytics • 
                  <span className="font-bold text-primary ml-1 transition-all duration-300">
                    {filteredData.length} campaigns
                  </span>
                  {filteredData.length !== tableData.length && (
                    <span className="text-muted-foreground ml-1">
                      (filtered from {tableData.length})
                    </span>
                  )}
                </CardDescription>
              </div>
              
              <Button
                onClick={addNewCampaign}
                disabled={isAddingRow}
                size="sm"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingRow ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Adding...
                  </div>
                ) : (
                  <>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Campaign
                  </>
                )}
              </Button>
            </div>
            
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white/50 dark:bg-gray-900/50 border-white/20"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50 border-b border-white/10">
                  <TableHead className="text-xs sm:text-sm font-semibold">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("campaign")}
                      className="h-auto p-0 font-semibold text-xs sm:text-sm hover:bg-transparent hover:text-blue-600 transition-colors"
                    >
                      Campaign
                      <ArrowUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell text-xs sm:text-sm font-semibold">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("clicks")}
                      className="h-auto p-0 font-semibold text-xs sm:text-sm hover:bg-transparent hover:text-blue-600 transition-colors"
                    >
                      Clicks
                      <ArrowUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-xs sm:text-sm font-semibold">CTR</TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("cost")}
                      className="h-auto p-0 font-semibold text-xs sm:text-sm hover:bg-transparent hover:text-blue-600 transition-colors"
                    >
                      Cost
                      <ArrowUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell text-xs sm:text-sm font-semibold">Conversions</TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="relative">
                {paginatedData.map((item, index) => {
                  const isNewRow = newRowIds.has(item.id)
                  const shouldPush = pushingRows && !isNewRow
                  
                  return (
                    <TableRow 
                      key={item.id} 
                      className={`
                        hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 relative group
                        ${isNewRow ? 'new-row' : ''}
                        ${shouldPush ? 'push-down' : ''}
                        border-b border-white/5
                      `}
                    >
                      <TableCell className="font-medium text-xs sm:text-sm py-4">
                        <div className="flex items-center gap-3">
                          {isNewRow && (
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                              <Sparkles className="h-3 w-3 text-green-500 animate-pulse" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className={`transition-all duration-300 ${
                              isNewRow ? 'font-bold text-green-700 dark:text-green-300' : 'group-hover:text-blue-600'
                            }`}>
                              {item.campaign}
                            </span>
                            {isNewRow && (
                              <Badge 
                                variant="secondary" 
                                className="mt-1 w-fit bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs animate-pulse"
                              >
                                NEW
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden sm:table-cell text-xs sm:text-sm py-4">
                        <div className="flex flex-col">
                          <span className={`font-semibold transition-all duration-300 ${
                            isNewRow ? 'text-green-600' : 'group-hover:text-blue-600'
                          }`}>
                            {item.clicks.toLocaleString()}
                          </span>
                          {getChangeIndicator(item.clicks)}
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden md:table-cell text-xs sm:text-sm py-4">
                        <div className="flex flex-col">
                          <span className={`font-semibold transition-all duration-300 ${
                            isNewRow ? 'text-green-600' : 'group-hover:text-blue-600'
                          }`}>
                            {item.ctr.toFixed(2)}%
                          </span>
                          {getChangeIndicator(item.ctr)}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-xs sm:text-sm py-4">
                        <div className="flex flex-col">
                          <span className={`font-semibold transition-all duration-300 ${
                            isNewRow ? 'text-green-600' : 'group-hover:text-blue-600'
                          }`}>
                            ${item.cost.toLocaleString()}
                          </span>
                          {getChangeIndicator(item.cost)}
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden sm:table-cell text-xs sm:text-sm py-4">
                        <div className="flex flex-col">
                          <span className={`font-semibold transition-all duration-300 ${
                            isNewRow ? 'text-green-600' : 'group-hover:text-blue-600'
                          }`}>
                            {item.conversions}
                          </span>
                          {getChangeIndicator(item.conversions)}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-xs sm:text-sm py-4">
                        <div className={`transition-all duration-300 ${
                          isNewRow ? 'scale-110' : 'group-hover:scale-105'
                        }`}>
                          {getStatusBadge(item.status)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                
                {/* Empty state */}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center">
                          <Search className="h-8 w-8 opacity-50" />
                        </div>
                        <div>
                          <p className="font-semibold">No campaigns found</p>
                          <p className="text-xs mt-1">Try adjusting your search terms</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 p-6 border-t border-white/10 bg-gradient-to-r from-white/30 to-blue-50/30 dark:from-gray-900/30 dark:to-blue-950/30">
            <div className="text-xs sm:text-sm text-muted-foreground font-medium">
              <span>
                Showing {paginatedData.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} results
              </span>
              {tableData.length > 0 && (
                <span className="ml-2 text-green-600 font-bold">
                  • {tableData.length} total campaigns
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-xs transition-all duration-200 hover:scale-105 hover:shadow-md bg-white/50 dark:bg-gray-900/50 border-white/20"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 p-0 text-xs transition-all duration-200 ${
                        currentPage === pageNum 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 scale-110 shadow-lg' 
                          : 'hover:scale-105 bg-white/50 dark:bg-gray-900/50 border-white/20 hover:shadow-md'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="text-xs transition-all duration-200 hover:scale-105 hover:shadow-md bg-white/50 dark:bg-gray-900/50 border-white/20"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
