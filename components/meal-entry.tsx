import { ChevronDown, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

interface MealEntryProps {
  title: string
  time: string
  calories: number
  protein: number
  carbs: number
  fat: number
  items: { name: string; calories: number }[]
  nutritionLoading?: boolean
}

export function MealEntry({ title, time, calories, protein, carbs, fat, items, nutritionLoading = false }: MealEntryProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{time}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-medium">{calories} kcal</p>
            {nutritionLoading ? (
              <p className="text-xs text-muted-foreground">Loading nutrition...</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                P: {protein}g • C: {carbs}g • F: {fat}g
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="mt-2">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="h-1.5 rounded-full bg-blue-100">
            <div className="h-full rounded-full bg-blue-500" style={{ width: `${(protein / 150) * 100}%` }} />
          </div>
          <div className="h-1.5 rounded-full bg-yellow-100">
            <div className="h-full rounded-full bg-yellow-500" style={{ width: `${(carbs / 250) * 100}%` }} />
          </div>
          <div className="h-1.5 rounded-full bg-red-100">
            <div className="h-full rounded-full bg-red-500" style={{ width: `${(fat / 65) * 100}%` }} />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span>{item.name}</span>
              <span className="text-muted-foreground">{item.calories} kcal</span>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="w-full mt-2">
            <Plus className="mr-2 h-3 w-3" />
            Add Food
          </Button>
        </div>
      </div>
    </div>
  )
}
