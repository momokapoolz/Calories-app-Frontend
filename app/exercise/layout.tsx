import { ProtectedRoute } from "@/components/protected-route"

export default function ExerciseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
} 