import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ExerciseItemProps {
  name: string
  category: string
  caloriesPerHour: number
  duration: number
}

export function ExerciseItem({ name, category, caloriesPerHour, duration }: ExerciseItemProps) {
  // Calculate calories burned based on duration in minutes
  const caloriesBurned = Math.round((caloriesPerHour / 60) * duration)

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <h4 className="font-medium">{name}</h4>
        <p className="text-sm text-muted-foreground">{category}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{caloriesBurned} kcal</p>
          <p className="text-xs text-muted-foreground">
            {duration} min • {caloriesPerHour} kcal/hr
          </p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add {name}</span>
        </Button>
      </div>
    </div>
  )
}
