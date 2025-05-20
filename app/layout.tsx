import type { Metadata } from 'next'
import './globals.css'
import { Inter } from "next/font/google"
import { AuthWrapper } from "@/components/auth-wrapper"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

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
      <body className={`${inter.className} min-h-screen bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthWrapper>{children}</AuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
