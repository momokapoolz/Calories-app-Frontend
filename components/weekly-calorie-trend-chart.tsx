"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { WeeklyNutritionData } from "@/app/meal/hooks/useWeeklyNutrition"

interface WeeklyCalorieTrendChartProps {
  data: WeeklyNutritionData[]
  loading?: boolean
}

export function WeeklyCalorieTrendChart({ data, loading }: WeeklyCalorieTrendChartProps) {
  // Transform data for the chart
  const chartData = data.map((day) => ({
    day: new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
    calories: day.calories,
    date: day.date
  }))

  const chartConfig = {
    calories: {
      label: "Calories",
      color: "hsl(var(--chart-1))",
    },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">No data available</p>
          <p className="text-sm text-muted-foreground">Log some meals to see your trend</p>
        </div>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="day" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          domain={[0, 'dataMax + 200']}
        />
        <ChartTooltip 
          content={
            <ChartTooltipContent 
              labelFormatter={(value, payload) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload
                  return new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'short', 
                    day: 'numeric' 
                  })
                }
                return value
              }}
              formatter={(value, name) => [
                `${value} kcal`,
                name
              ]}
            />
          }
        />
        <Line 
          type="monotone" 
          dataKey="calories" 
          stroke="var(--color-calories)"
          strokeWidth={3}
          dot={{ 
            fill: "var(--color-calories)", 
            strokeWidth: 2,
            stroke: "hsl(var(--background))",
            r: 5
          }}
          activeDot={{ 
            r: 6, 
            stroke: "var(--color-calories)",
            strokeWidth: 2,
            fill: "hsl(var(--background))"
          }}
        />
      </LineChart>
    </ChartContainer>
  )
} 