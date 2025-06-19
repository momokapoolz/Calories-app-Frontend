import Image from "next/image"
import { Edit, Trash2, Beaker } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FoodWithNutrition, Nutrient, FoodNutrient, CreateFoodNutrient } from "../types"
import { FoodForm } from "./FoodForm"
import { NutritionForm } from "./NutritionForm"

interface FoodCardProps {
  food: FoodWithNutrition
  nutrients: Nutrient[]
  onEdit: (id: number, data: any) => Promise<any>
  onDelete: (id: number) => Promise<any>
  onAddNutrient: (foodId: number, nutrientData: CreateFoodNutrient) => Promise<any>
  onUpdateNutrient: (foodId: number, nutrientId: number, nutrientData: CreateFoodNutrient) => Promise<any>
  onRemoveNutrient: (foodId: number, nutrientId: number) => Promise<void>
  showEditActions?: boolean
  showAddToMeal?: boolean
  onAddToMeal?: (food: FoodWithNutrition) => void
}

export function FoodCard({
  food,
  nutrients,
  onEdit,
  onDelete,
  onAddNutrient,
  onUpdateNutrient,
  onRemoveNutrient,
  showEditActions = true,
  showAddToMeal = false,
  onAddToMeal
}: FoodCardProps) {
  const defaultImage = "/placeholder-food.png"

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg">
      {/* Food Image */}
      <div className="flex-shrink-0">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
          <Image
            src={food.image_url || defaultImage}
            alt={food.name}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = defaultImage
            }}
          />
        </div>
      </div>

      {/* Food Information */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-medium truncate">{food.name}</h3>
          <Badge variant={food.source === 'USER' ? 'default' : 'secondary'}>
            {food.source}
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground mb-2">
          <span>Serving: {food.serving_size_gram}g</span>
          {(food.calories || 0) > 0 && (
            <span className="ml-4">
              {food.calories} cal | {food.protein}g protein | {food.carbs}g carbs | {food.fat}g fat
            </span>
          )}
        </div>

        {/* Nutrients Preview */}
        {food.nutrients && food.nutrients.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {food.nutrients.slice(0, 3).map((nutrient) => (
              <Badge key={nutrient.id} variant="outline" className="text-xs">
                {nutrient.nutrient?.name}: {nutrient.amount_per_100g}g
              </Badge>
            ))}
            {food.nutrients.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{food.nutrients.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-shrink-0">
        {/* Nutrition Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Beaker className="h-4 w-4 mr-1" />
              {showEditActions ? 'Nutrition' : 'View'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {showEditActions ? 'Manage' : 'View'} Nutrition - {food.name}
              </DialogTitle>
            </DialogHeader>
            <NutritionForm
              food={food}
              nutrients={nutrients}
              onAddNutrient={onAddNutrient}
              onUpdateNutrient={onUpdateNutrient}
              onRemoveNutrient={onRemoveNutrient}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Button (for user foods) */}
        {showEditActions && (
          <FoodForm 
            food={food} 
            onSubmit={(data) => onEdit(food.id!, data)}
            buttonText={<Edit className="h-4 w-4" />}
          />
        )}

        {/* Add to Meal Button (for database foods) */}
        {showAddToMeal && onAddToMeal && (
          <Button 
            size="sm"
            onClick={() => onAddToMeal(food)}
          >
            Add to Meal
          </Button>
        )}

        {/* Delete Button (for user foods) */}
        {showEditActions && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(food.id!)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
} 