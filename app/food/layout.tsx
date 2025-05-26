import { ProtectedRoute } from "@/components/protected-route"

export default function FoodLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
} 