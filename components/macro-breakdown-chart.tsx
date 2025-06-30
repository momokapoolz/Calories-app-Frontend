"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell } from "recharts"

interface MacroBreakdownChartProps {
  protein: number // grams
  carbs: number   // grams  
  fat: number     // grams
  loading?: boolean
}

export function MacroBreakdownChart({ protein, carbs, fat, loading }: MacroBreakdownChartProps) {
  // Convert grams to calories (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
  const proteinCalories = protein * 4
  const carbsCalories = carbs * 4
  const fatCalories = fat * 9

  const chartData = [
    {
      macro: "Protein",
      calories: proteinCalories,
      grams: protein,
      color: "#60a5fa" // blue-400
    },
    {
      macro: "Carbs", 
      calories: carbsCalories,
      grams: carbs,
      color: "#34d399" // emerald-400
    },
    {
      macro: "Fats",
      calories: fatCalories,
      grams: fat,
      color: "#fb7185" // rose-400
    }
  ]

  const chartConfig = {
    calories: {
      label: "Calories",
    },
    protein: {
      label: "Protein",
      color: "#60a5fa",
    },
    carbs: {
      label: "Carbs", 
      color: "#34d399",
    },
    fats: {
      label: "Fats",
      color: "#fb7185",
    },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading macro data...</p>
        </div>
      </div>
    )
  }

  const totalCalories = proteinCalories + carbsCalories + fatCalories

  if (totalCalories === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">No macro data</p>
          <p className="text-sm text-muted-foreground">Log some meals to see breakdown</p>
        </div>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="macro"
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
          domain={[0, 'dataMax + 50']}
        />
        <ChartTooltip 
          content={
            <ChartTooltipContent 
              formatter={(value, name, props) => {
                const data = props.payload
                return [
                  `${value} kcal (${data.grams}g)`,
                  data.macro
                ]
              }}
              labelFormatter={(label) => `${label} Breakdown`}
            />
          }
        />
        <Bar 
          dataKey="calories" 
          radius={[4, 4, 0, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
} 