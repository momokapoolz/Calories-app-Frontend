import { ProtectedRoute } from "@/components/protected-route"

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
} 