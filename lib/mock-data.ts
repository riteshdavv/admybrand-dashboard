export function generateMockData() {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  
  // Generate revenue data
  const revenueData = months.slice(0, 6).map((month, index) => ({
    month,
    revenue: Math.floor(Math.random() * 50000) + 30000 + (index * 5000)
  }))

  // Generate user growth data
  const userGrowthData = months.slice(0, 6).map((month) => ({
    month,
    newUsers: Math.floor(Math.random() * 2000) + 1000,
    returningUsers: Math.floor(Math.random() * 1500) + 800
  }))

  // Generate conversion data
  const conversionData = [
    { source: "organic", conversions: Math.floor(Math.random() * 500) + 300, fill: "var(--color-organic)" },
    { source: "paid", conversions: Math.floor(Math.random() * 400) + 200, fill: "var(--color-paid)" },
    { source: "social", conversions: Math.floor(Math.random() * 300) + 150, fill: "var(--color-social)" },
    { source: "email", conversions: Math.floor(Math.random() * 200) + 100, fill: "var(--color-email)" }
  ]

  // Generate table data with dynamic count
  const campaigns = [
    "Summer Sale Campaign", "Brand Awareness Drive", "Product Launch", "Holiday Special", 
    "Back to School", "Black Friday", "New Year Promotion", "Spring Collection",
    "Customer Retention", "Lead Generation", "Flash Sale", "Weekend Special",
    "VIP Member Exclusive", "Clearance Sale", "Brand Partnership", "Influencer Collab",
    "Mobile App Promotion", "Email Newsletter", "Social Media Boost", "Retargeting Campaign"
  ]
  
  const statuses = ["active", "paused", "completed"] as const
  
  // Generate between 12-20 campaigns for variety
  const campaignCount = Math.floor(Math.random() * 9) + 12
  
  const tableData = Array.from({ length: campaignCount }, (_, index) => ({
    id: `campaign-${index + 1}-${Date.now()}`,
    campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
    clicks: Math.floor(Math.random() * 10000) + 1000,
    impressions: Math.floor(Math.random() * 100000) + 10000,
    ctr: Math.random() * 5 + 1,
    cost: Math.floor(Math.random() * 5000) + 500,
    conversions: Math.floor(Math.random() * 100) + 10,
    status: statuses[Math.floor(Math.random() * statuses.length)]
  }))

  // Generate metrics
  const metrics = {
    revenue: revenueData.reduce((sum, item) => sum + item.revenue, 0),
    revenueChange: Math.floor(Math.random() * 20) - 10,
    users: userGrowthData.reduce((sum, item) => sum + item.newUsers + item.returningUsers, 0),
    usersChange: Math.floor(Math.random() * 15) + 5,
    conversions: conversionData.reduce((sum, item) => sum + item.conversions, 0),
    conversionsChange: Math.floor(Math.random() * 25) - 5,
    growth: Math.floor(Math.random() * 30) + 10,
    growthChange: Math.floor(Math.random() * 10) + 2
  }

  return {
    metrics,
    revenueData,
    userGrowthData,
    conversionData,
    tableData
  }
}
