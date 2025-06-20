"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { FoodSearch } from "./FoodSearch"
import { useFood } from "@/app/food/hooks/useFood"
import { MealType, CreateMealLog, CreateMealLogItem } from "../types"

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const

const mealFormSchema = z.object({
  meal_type: z.enum(MEAL_TYPES),
})

type MealFormData = z.infer<typeof mealFormSchema>

interface MealFormProps {
  onSubmit: (data: CreateMealLog) => Promise<void>
  defaultValues?: Partial<MealFormData>
  buttonText?: React.ReactNode
  className?: string
}

export function MealForm({ onSubmit, defaultValues, buttonText, className }: MealFormProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [selectedFoodItems, setSelectedFoodItems] = useState<CreateMealLogItem[]>([])
  const { foods } = useFood()

  const form = useForm<MealFormData>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      meal_type: defaultValues?.meal_type || "Breakfast",
    },
  })

  const handleSubmit = async (data: MealFormData) => {
    // Validate that we have at least one food item
    if (selectedFoodItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one food item",
        variant: "destructive",
      })
      return
    }

    // Validate that all food items have valid food_ids (not temporary)
    const hasInvalidItems = selectedFoodItems.some(item => 
      !foods.some(food => food.id === item.food_id)
    )
    
    if (hasInvalidItems) {
      toast({
        title: "Validation Error", 
        description: "Please ensure all food items are selected from the food database",
        variant: "destructive",
      })
      return
    }

    try {
      await onSubmit({
        meal_type: data.meal_type,
        items: selectedFoodItems,
      })
      setOpen(false)
      form.reset()
      setSelectedFoodItems([])
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error in MealForm:', error)
    }
  }

  const handleAddFoodItem = (item: CreateMealLogItem) => {
    // Add food name for better display
    const food = foods.find(f => f.id === item.food_id)
    const enhancedItem = {
      ...item,
      food_name: food?.name || `Food ID: ${item.food_id}`
    }
    setSelectedFoodItems(prev => [...prev, enhancedItem])
  }



  const handleRemoveFoodItem = (index: number) => {
    setSelectedFoodItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdateFoodItem = (index: number, updates: Partial<CreateMealLogItem>) => {
    setSelectedFoodItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, ...updates } : item
      )
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className}>
          {buttonText || (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Meal
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Create New Meal</DialogTitle>
              <DialogDescription>
                Add food items to your meal log. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="meal_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select meal type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MEAL_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Food Items</FormLabel>
                </div>

                {/* Food Search Component */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Search & Add Foods</h4>
                  <FoodSearch onSelectFood={handleAddFoodItem} />
                </div>
                
                {selectedFoodItems.length > 0 && (
                  <div className="space-y-2">
                    {selectedFoodItems.map((item, index) => (
                      <div
                        key={`${item.food_id}-${index}`}
                        className="flex items-center gap-2 p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-muted-foreground">Food</label>
                              <div className="text-sm font-medium">
                                {item.food_name || foods.find(f => f.id === item.food_id)?.name || `Food ID: ${item.food_id}`}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <label className="text-xs text-muted-foreground">Quantity</label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateFoodItem(index, { quantity: Number(e.target.value) })}
                              className="w-20 h-8"
                              step="0.1"
                              min="0"
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs text-muted-foreground">Grams</label>
                            <Input
                              type="number"
                              value={item.quantity_grams}
                              onChange={(e) => handleUpdateFoodItem(index, { quantity_grams: Number(e.target.value) })}
                              className="w-20 h-8"
                              step="0.1"
                              min="0"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFoodItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedFoodItems.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No food items. Click "Add Item" to add food items.
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={selectedFoodItems.length === 0}>
                Save Meal
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 