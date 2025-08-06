"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { Download, FileText, Table, Loader2 } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface ExportButtonsProps {
  data: any
}

export function ExportButtons({ data }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPDF = async () => {
    setIsExporting(true)
    
    try {
      const pdf = new jsPDF()
      
      // Add title
      pdf.setFontSize(20)
      pdf.text('ADmyBRAND Insights - Analytics Report', 20, 20)
      
      // Add generation date
      pdf.setFontSize(12)
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35)
      
      // Add metrics summary
      pdf.setFontSize(16)
      pdf.text('Key Metrics', 20, 55)
      
      const metricsData = [
        ['Metric', 'Value', 'Change'],
        ['Total Revenue', `$${data.metrics.revenue.toLocaleString()}`, `${data.metrics.revenueChange > 0 ? '+' : ''}${data.metrics.revenueChange}%`],
        ['Active Users', data.metrics.users.toLocaleString(), `${data.metrics.usersChange > 0 ? '+' : ''}${data.metrics.usersChange}%`],
        ['Conversions', data.metrics.conversions.toLocaleString(), `${data.metrics.conversionsChange > 0 ? '+' : ''}${data.metrics.conversionsChange}%`],
        ['Growth Rate', `${data.metrics.growth}%`, `${data.metrics.growthChange > 0 ? '+' : ''}${data.metrics.growthChange}%`]
      ]
      
      ;(pdf as any).autoTable({
        head: [metricsData[0]],
        body: metricsData.slice(1),
        startY: 65,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      })
      
      // Add campaign data
      pdf.setFontSize(16)
      pdf.text('Campaign Performance', 20, (pdf as any).lastAutoTable.finalY + 20)
      
      const campaignData = data.tableData.slice(0, 10).map((item: any) => [
        item.campaign,
        item.clicks.toLocaleString(),
        `${item.ctr.toFixed(2)}%`,
        `$${item.cost.toLocaleString()}`,
        item.conversions.toString(),
        item.status
      ])
      
      ;(pdf as any).autoTable({
        head: [['Campaign', 'Clicks', 'CTR', 'Cost', 'Conversions', 'Status']],
        body: campaignData,
        startY: (pdf as any).lastAutoTable.finalY + 30,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      })
      
      pdf.save('admybrand-analytics-report.pdf')
      
      toast({
        title: "Export Successful",
        description: "PDF report has been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF report.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const exportToCSV = async () => {
    setIsExporting(true)
    
    try {
      // Prepare CSV data
      const csvData = [
        ['Campaign', 'Clicks', 'Impressions', 'CTR', 'Cost', 'Conversions', 'Status'],
        ...data.tableData.map((item: any) => [
          item.campaign,
          item.clicks,
          item.impressions,
          item.ctr.toFixed(2),
          item.cost,
          item.conversions,
          item.status
        ])
      ]
      
      const csvContent = csvData.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', 'admybrand-analytics-data.csv')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      
      toast({
        title: "Export Successful",
        description: "CSV data has been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating the CSV file.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF} disabled={isExporting}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV} disabled={isExporting}>
          <Table className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
