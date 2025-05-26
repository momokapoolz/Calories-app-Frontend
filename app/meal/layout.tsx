import { ProtectedRoute } from "@/components/protected-route"

export default function MealLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
} 