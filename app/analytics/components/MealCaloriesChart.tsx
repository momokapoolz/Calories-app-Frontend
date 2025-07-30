'use client'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"

interface FoodItemSummary {
  id: number
  food_id: number
  food_name: string
  quantity: number
  quantity_grams: number
  calories: number
}

interface MealLogSummary {
  id: number
  meal_type: string
  created_at: string
  total_calories: number
  food_items: FoodItemSummary[]
}

interface MealCaloriesChartProps {
  data: MealLogSummary[]
  loading?: boolean
}

export function MealCaloriesChart({ data, loading }: MealCaloriesChartProps) {
  // Transform data for the chart
  const chartData = data.map((meal) => ({
    mealType: meal.meal_type,
    calories: meal.total_calories,
    // Format time for tooltip
    time: new Date(meal.created_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    foodCount: meal.food_items.length
  }))

  // Chart configuration
  const chartConfig = {
    calories: {
      label: "Calories",
      color: "hsl(var(--chart-1))",
    },
  }

  // Color palette for different meal types
  const getBarColor = (mealType: string) => {
    const colors: { [key: string]: string } = {
      'Breakfast': '#8884d8',
      'Lunch': '#82ca9d', 
      'Dinner': '#ffc658',
      'Snack': '#ff7c7c',
      'Brunch': '#8dd1e1',
      'Supper': '#d084d0'
    }
    return colors[mealType] || '#8884d8'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">Loading chart data...</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">No meal data available to display</p>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="mealType" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: 'Calories', angle: -90, position: 'insideLeft' }}
          />
          <ChartTooltip
            cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
            content={
              <ChartTooltipContent
                formatter={(value, name) => [
                  `${value} kcal`,
                  'Calories'
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0) {
                    const data = payload[0].payload
                    return (
                      <div className="space-y-1">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">Time: {data.time}</p>
                        <p className="text-sm text-muted-foreground">Food items: {data.foodCount}</p>
                      </div>
                    )
                  }
                  return label
                }}
              />
            }
          />
          <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.mealType)} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  )
} 