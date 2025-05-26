"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { useFood } from "@/app/food/hooks/useFood"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CreateMealLogItem } from "../types"

interface FoodSearchProps {
  onSelectFood: (food: CreateMealLogItem) => void
}

const foodItemSchema = z.object({
  quantity: z.number().min(0),
  quantity_grams: z.number().min(0),
})

type FoodItemFormData = z.infer<typeof foodItemSchema>

export function FoodSearch({ onSelectFood }: FoodSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null)
  const { foods, loading } = useFood()
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<FoodItemFormData>({
    resolver: zodResolver(foodItemSchema),
    defaultValues: {
      quantity: 1,
      quantity_grams: 100,
    },
  })

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleFoodSelect = (foodId: number) => {
    setSelectedFoodId(foodId)
    setDialogOpen(true)
  }

  const handleSubmit = (data: FoodItemFormData) => {
    if (selectedFoodId) {
      onSelectFood({
        food_id: selectedFoodId,
        quantity: data.quantity,
        quantity_grams: data.quantity_grams,
      })
      setDialogOpen(false)
      setSelectedFoodId(null)
      form.reset()
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search foods..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
          {filteredFoods.map((food) => (
            <div
              key={food.id}
              className="p-3 hover:bg-muted cursor-pointer"
              onClick={() => handleFoodSelect(food.id!)}
            >
              <div className="font-medium">{food.name}</div>
              <div className="text-sm text-muted-foreground">
                {food.serving_size_gram}g | {food.calories} kcal
              </div>
            </div>
          ))}
          {filteredFoods.length === 0 && (
            <div className="p-3 text-center text-muted-foreground">
              No foods found
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <DialogHeader>
                <DialogTitle>Add Food Item</DialogTitle>
                <DialogDescription>
                  Specify the quantity for this food item.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity (servings)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity_grams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity (grams)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Add to Meal</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 