"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarDays, ChevronDown, Filter, Plus, Search, Utensils } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ProtectedRoute } from "@/components/protected-route"
import { MainNav } from "@/components/main-nav"
import { MealForm } from "./components/MealForm"
import { useMealLogs } from "./hooks/useMealLogs"
import { MealLog, MealType, CreateMealLog } from "./types"

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const

export default function MealPage() {
  const [date, setDate] = useState<Date>(new Date())
  const { mealLogs, loading, error, addMealLog, updateMealLog, deleteMealLog } = useMealLogs()
  const [searchTerm, setSearchTerm] = useState("")

  const formattedDate = format(date, "PPP")

  // Filter meals for the selected date
  const mealsForDate = mealLogs.filter((meal: MealLog) => {
    const mealDate = new Date(meal.created_at)
    return (
      mealDate.getFullYear() === date.getFullYear() &&
      mealDate.getMonth() === date.getMonth() &&
      mealDate.getDate() === date.getDate()
    )
  })

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <MainNav />        <main className="flex-1">
          <div className="container py-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">Meal Planner</h1>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {formattedDate}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => date && setDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <MealForm onSubmit={addMealLog} />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Tabs defaultValue={MEAL_TYPES[0].toLowerCase()}>
                <TabsList>
                  {MEAL_TYPES.map((type) => (
                    <TabsTrigger key={type} value={type.toLowerCase()}>
                      {type}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {MEAL_TYPES.map((type) => (
                  <TabsContent key={type} value={type.toLowerCase()} className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>{type}</CardTitle>
                        <CardDescription>
                          Meals logged for {type.toLowerCase()} on {formattedDate}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="text-center py-4">Loading...</div>
                        ) : (
                          <div className="space-y-4">
                            {mealsForDate
                              .filter((meal: MealLog) => meal.meal_type === type)
                              .map((meal: MealLog) => (
                                <div
                                  key={meal.id}
                                  className="flex flex-col gap-2 p-4 border rounded-lg"
                                >
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-medium">
                                      {format(new Date(meal.created_at), "h:mm a")}
                                    </h3>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => updateMealLog(meal.id, meal)}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => deleteMealLog(meal.id)}
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                  {/* Meal items will be rendered here */}
                                  <div className="space-y-2">
                                    {meal.items?.map(item => (
                                      <div
                                        key={item.id}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <span>{item.food_name}</span>
                                        <span className="text-muted-foreground">
                                          {item.quantity_grams}g
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  {/* Nutritional totals */}
                                  <div className="mt-2 pt-2 border-t">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Total Calories:</span>
                                      <span>{meal.total_calories} kcal</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Protein:</span>
                                      <span>{meal.total_protein}g</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            {mealsForDate.filter((meal: MealLog) => meal.meal_type === type).length === 0 && (
                              <div className="text-center py-8">
                                <p className="text-muted-foreground">No meals logged for {type.toLowerCase()}</p>
                                <MealForm
                                  onSubmit={(data: CreateMealLog) => addMealLog({ ...data, meal_type: type as MealType })}
                                  className="mt-4"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 