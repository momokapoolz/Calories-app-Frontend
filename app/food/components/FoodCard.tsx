import Image from "next/image"
import { useState } from "react"
import { Beaker, ImageOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FoodWithNutrition, Nutrient, FoodNutrient, CreateFoodNutrient } from "../types"
import { NutritionForm } from "./NutritionForm"

interface FoodImageProps {
  src: string | null
  alt: string
  className?: string
}

function FoodImage({ src, alt, className }: FoodImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [imageSrc, setImageSrc] = useState(src)
  const defaultImage = "/placeholder-food.png"

  const handleImageLoad = () => {
    setImageState('loaded')
  }

  const handleImageError = () => {
    if (imageSrc !== defaultImage) {
      setImageSrc(defaultImage)
      setImageState('loading') // Will try to load the default image
    } else {
      setImageState('error') // Even default image failed
    }
  }

  const effectiveSrc = imageSrc || defaultImage

  return (
    <div className={`relative ${className} bg-muted rounded-lg overflow-hidden`}>
      {/* Loading state */}
      {imageState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="animate-pulse w-8 h-8 bg-muted-foreground/20 rounded-full"></div>
        </div>
      )}
      
      {/* Error state - show when even placeholder fails */}
      {imageState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <ImageOff className="w-6 h-6 text-muted-foreground/50" />
        </div>
      )}

      {/* Actual image */}
      <Image
        src={effectiveSrc}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-200 ${
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        priority={false}
      />
    </div>
  )
}

interface FoodCardProps {
  food: FoodWithNutrition
  nutrients: Nutrient[]
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
  onAddNutrient,
  onUpdateNutrient,
  onRemoveNutrient,
  showEditActions = true,
  showAddToMeal = false,
  onAddToMeal
}: FoodCardProps) {
  return (
    <div className="flex items-start gap-6 p-6 border rounded-lg">
      {/* Food Image */}
      <div className="flex-shrink-0">
        <FoodImage
          src={food.image_url || null}
          alt={food.name}
          className="w-32 h-32"
        />
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
              View Nutrition
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                View Nutrition - {food.name}
              </DialogTitle>
            </DialogHeader>
            <NutritionForm
              food={food}
              nutrients={nutrients}
              onAddNutrient={onAddNutrient}
              onUpdateNutrient={onUpdateNutrient}
              onRemoveNutrient={onRemoveNutrient}
              readOnly={true}
            />
          </DialogContent>
        </Dialog>

        {/* Add to Meal Button (for database foods) */}
        {showAddToMeal && onAddToMeal && (
          <Button 
            size="sm"
            onClick={() => onAddToMeal(food)}
          >
            Add to Meal
          </Button>
        )}
      </div>
    </div>
  )
} 