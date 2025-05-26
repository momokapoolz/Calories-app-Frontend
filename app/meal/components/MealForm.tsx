"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
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
import { MealType, CreateMealLog, CreateMealLogItem } from "../types"

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const

const mealFormSchema = z.object({
  meal_type: z.enum(MEAL_TYPES),
  items: z.array(z.object({
    food_id: z.number(),
    quantity: z.number().min(0),
    quantity_grams: z.number().min(0),
  })).min(1, "Please add at least one food item"),
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

  const form = useForm<MealFormData>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      meal_type: defaultValues?.meal_type || "Breakfast",
      items: defaultValues?.items || [],
    },
  })

  const handleSubmit = async (data: MealFormData) => {
    try {
      await onSubmit({
        meal_type: data.meal_type,
        items: selectedFoodItems,
      })
      setOpen(false)
      form.reset()
      setSelectedFoodItems([])
      toast({
        title: "Success",
        description: "Meal log created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create meal log",
        variant: "destructive",
      })
    }
  }

  const handleAddFoodItem = (item: CreateMealLogItem) => {
    setSelectedFoodItems(prev => [...prev, item])
  }

  const handleRemoveFoodItem = (index: number) => {
    setSelectedFoodItems(prev => prev.filter((_, i) => i !== index))
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
                <FormLabel>Food Items</FormLabel>
                <FoodSearch onSelectFood={handleAddFoodItem} />
                
                {selectedFoodItems.length > 0 && (
                  <div className="space-y-2">
                    {selectedFoodItems.map((item, index) => (
                      <div
                        key={`${item.food_id}-${index}`}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span>{item.food_id}</span>
                          <span>{item.quantity_grams}g</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFoodItem(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
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