import type { Metadata } from 'next'
import './globals.css'

import { MainNav } from "@/components/main-nav"

export const metadata: Metadata = {
  title: 'NutriTrack - Calorie and Nutrition Tracker',
  description: 'Track your calories, nutrition, and exercise with NutriTrack',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">{children}</body>
    </html>
  )
}
