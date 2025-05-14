import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

interface FoodItemProps {
  name: string
  serving: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export function FoodItem({ name, serving, calories, protein, carbs, fat }: FoodItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <h4 className="font-medium">{name}</h4>
        <p className="text-sm text-muted-foreground">{serving}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{calories} kcal</p>
          <p className="text-xs text-muted-foreground">
            P: {protein}g • C: {carbs}g • F: {fat}g
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
