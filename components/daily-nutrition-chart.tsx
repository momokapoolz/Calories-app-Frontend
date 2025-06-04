"use client"

import { useEffect, useRef } from "react"

interface DailyNutritionChartProps {
  protein: number;
  carbs: number;
  fat: number;
  totalCalories?: number;
}

export function DailyNutritionChart({ protein, carbs, fat, totalCalories }: DailyNutritionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Data for the pie chart
    const data = [
      { label: "Protein", value: protein, color: "#3b82f6" }, // Blue
      { label: "Carbs", value: carbs, color: "#eab308" }, // Yellow
      { label: "Fat", value: fat, color: "#ef4444" }, // Red
    ]

    const total = data.reduce((sum, item) => sum + item.value, 0)

    // Draw the pie chart
    let startAngle = 0
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) * 0.8

    // If no data yet, draw empty circle
    if (total === 0) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.strokeStyle = "#e5e7eb"
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Draw text in center
      ctx.fillStyle = "#6b7280"
      ctx.font = "bold 16px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("No data", centerX, centerY - 10)
      ctx.font = "12px sans-serif"
      ctx.fillText("yet", centerX, centerY + 10)
      
      return;
    }

    data.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()

      ctx.fillStyle = item.color
      ctx.fill()

      // Draw label
      const labelAngle = startAngle + sliceAngle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.6)
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.6)

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(item.label, labelX, labelY)

      startAngle += sliceAngle
    })

    // Draw center circle (donut hole)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI)
    ctx.fillStyle = "#ffffff"
    ctx.fill()

    // Calculate total calories (rough estimate: protein and carbs = 4 cal/g, fat = 9 cal/g)
    const calculatedCalories = Math.round((protein * 4) + (carbs * 4) + (fat * 9));
    const displayCalories = totalCalories !== undefined ? totalCalories : calculatedCalories;

    // Draw total calories in center
    ctx.fillStyle = "#000000"
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(displayCalories.toLocaleString(), centerX, centerY - 10)
    ctx.font = "12px sans-serif"
    ctx.fillText("calories", centerX, centerY + 10)
  }, [protein, carbs, fat, totalCalories])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
