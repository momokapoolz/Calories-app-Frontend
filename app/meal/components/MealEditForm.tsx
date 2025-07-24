"use client"

import { useState, useEffect } from "react"
import { Edit, Plus, X } from "lucide-react"
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
import { MealType, CreateMealLog, CreateMealLogItem, MealLog } from "../types"

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const

const mealFormSchema = z.object({
  meal_type: z.enum(MEAL_TYPES),
})

type MealFormData = z.infer<typeof mealFormSchema>

interface MealEditFormProps {
  meal: MealLog
  onSubmit: (id: number, data: CreateMealLog) => Promise<void>
  buttonText?: React.ReactNode
  className?: string
}

export function MealEditForm({ meal, onSubmit, buttonText, className }: MealEditFormProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [selectedFoodItems, setSelectedFoodItems] = useState<CreateMealLogItem[]>([])
  const { foods } = useFood()

  const form = useForm<MealFormData>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      meal_type: meal.meal_type,
    },
  })

  // Initialize selected food items when the dialog opens
  useEffect(() => {
    if (open && meal.items) {
      setSelectedFoodItems(meal.items.map(item => ({
        food_id: item.food_id,
        quantity: item.quantity,
        quantity_grams: item.quantity_grams,
      })))
    }
  }, [open, meal.items])

  const handleSubmit = async (data: MealFormData) => {
    console.log('🍽️ MealEditForm handleSubmit called with:', { data, selectedFoodItems, meal });
    
    // Validate that we have at least one food item
    if (selectedFoodItems.length === 0) {
      console.log('❌ Validation failed: No food items');
      toast({
        title: "Validation Error",
        description: "Please add at least one food item", 
        variant: "destructive",
      })
      return
    }

    const submitData = {
      meal_type: data.meal_type,
      items: selectedFoodItems,
    };

    console.log('📤 About to call onSubmit with:', { 
      mealId: meal.id, 
      submitData, 
      originalMealType: meal.meal_type,
      originalItems: meal.items || []
    });

    try {
      await onSubmit(meal.id, submitData)
      console.log('✅ onSubmit completed successfully');
      setOpen(false)
    } catch (error) {
      // Error handling is done in the parent component
      console.error('❌ Error in MealEditForm:', error)
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



  const handleDialogClose = () => {
    setOpen(false)
    // Reset form and selected items when closing
    form.reset({
      meal_type: meal.meal_type,
    })
    if (meal.items) {
      setSelectedFoodItems(meal.items.map(item => ({
        food_id: item.food_id,
        quantity: item.quantity,
        quantity_grams: item.quantity_grams,
      })))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          {buttonText || (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Meal Log</DialogTitle>
              <DialogDescription>
                Update your meal log. Click save when you're done.
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
                      value={field.value}
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
                
                {/* Existing food items */}
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
                                {foods.find(f => f.id === item.food_id)?.name || 
                                 meal.items?.find(mealItem => mealItem.food_id === item.food_id)?.food_name || 
                                 `Food ID: ${item.food_id}`}
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
                            <X className="h-4 w-4" />
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
            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDialogClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={selectedFoodItems.length === 0}
              >
                Update Meal
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 