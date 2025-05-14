"use client"

import { useEffect, useRef } from "react"

export function DailyNutritionChart() {
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
      { label: "Protein", value: 75, color: "#3b82f6" }, // Blue
      { label: "Carbs", value: 145, color: "#eab308" }, // Yellow
      { label: "Fat", value: 45, color: "#ef4444" }, // Red
    ]

    const total = data.reduce((sum, item) => sum + item.value, 0)

    // Draw the pie chart
    let startAngle = 0
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) * 0.8

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

    // Draw total calories in center
    ctx.fillStyle = "#000000"
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("1,245", centerX, centerY - 10)
    ctx.font = "12px sans-serif"
    ctx.fillText("calories", centerX, centerY + 10)
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
