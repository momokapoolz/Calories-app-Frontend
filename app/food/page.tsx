"use client"

import Link from "next/link"
import { CalendarDays, ChevronDown, Filter, Plus, Search, Utensils, Trash2, Edit, Beaker } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/protected-route"
import { MainNav } from "@/components/main-nav"
import { useFood } from "./hooks/useFood"
import { FoodForm } from "./components/FoodForm"
import { NutritionForm } from "./components/NutritionForm"
import { useState } from "react"

export default function FoodPage() {
  const { 
    foods, 
    nutrients, 
    loading, 
    error, 
    addFood, 
    editFood, 
    removeFood,
    addFoodNutrient,
    editFoodNutrient,
    removeFoodNutrient
  } = useFood()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter foods by source for different tabs
  const userFoods = filteredFoods.filter(food => food.source === 'USER')
  const databaseFoods = filteredFoods.filter(food => food.source !== 'USER')

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Food Database</h1>
              <FoodForm onSubmit={addFood} />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search foods..." 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Foods ({filteredFoods.length})</TabsTrigger>
                <TabsTrigger value="my-foods">My Foods ({userFoods.length})</TabsTrigger>
                <TabsTrigger value="database">Database ({databaseFoods.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>All Foods</CardTitle>
                    <CardDescription>Complete food database with nutrition information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">Loading foods...</p>
                      </div>
                    ) : filteredFoods.length > 0 ? (
                      <div className="grid gap-4">
                        {filteredFoods.map((food) => (
                          <div key={food.id} className="flex items-center justify-between p-4 border rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{food.name}</h3>
                                <Badge variant={food.source === 'USER' ? 'default' : 'secondary'}>
                                  {food.source}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <span>Serving: {food.serving_size_gram}g</span>
                                {(food.calories || 0) > 0 && (
                                  <span className="ml-4">
                                    {food.calories} cal | {food.protein}g protein | {food.carbs}g carbs | {food.fat}g fat
                                  </span>
                                )}
                              </div>
                              {food.nutrients && food.nutrients.length > 0 && (
                                <div className="flex gap-1 mt-2">
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
                            <div className="flex gap-2 ml-4">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Beaker className="h-4 w-4 mr-1" />
                                    Nutrition
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Manage Nutrition - {food.name}</DialogTitle>
                                  </DialogHeader>
                                  <NutritionForm
                                    food={food}
                                    nutrients={nutrients}
                                    onAddNutrient={addFoodNutrient}
                                    onUpdateNutrient={editFoodNutrient}
                                    onRemoveNutrient={removeFoodNutrient}
                                  />
                                </DialogContent>
                              </Dialog>
                              <FoodForm 
                                food={food} 
                                onSubmit={(data) => editFood(food.id!, data)}
                                buttonText={<Edit className="h-4 w-4" />}
                              />
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => removeFood(food.id!)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="mb-4 rounded-full bg-muted p-3 w-12 h-12 mx-auto flex items-center justify-center">
                          <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-lg font-medium">No foods found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {searchTerm ? `No foods match "${searchTerm}"` : 'No foods in database yet'}
                        </p>
                        {!searchTerm && <FoodForm onSubmit={addFood} buttonText="Add First Food" />}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="my-foods" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Custom Foods</CardTitle>
                    <CardDescription>Foods you've added to your personal database</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userFoods.length > 0 ? (
                      <div className="grid gap-4">
                        {userFoods.map((food) => (
                          <div key={food.id} className="flex items-center justify-between p-4 border rounded">
                            <div className="flex-1">
                              <h3 className="font-medium">{food.name}</h3>
                              <div className="text-sm text-muted-foreground">
                                <span>Serving: {food.serving_size_gram}g</span>
                                {(food.calories || 0) > 0 && (
                                  <span className="ml-4">
                                    {food.calories} cal | {food.protein}g protein | {food.carbs}g carbs | {food.fat}g fat
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Beaker className="h-4 w-4 mr-1" />
                                    Nutrition
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Manage Nutrition - {food.name}</DialogTitle>
                                  </DialogHeader>
                                  <NutritionForm
                                    food={food}
                                    nutrients={nutrients}
                                    onAddNutrient={addFoodNutrient}
                                    onUpdateNutrient={editFoodNutrient}
                                    onRemoveNutrient={removeFoodNutrient}
                                  />
                                </DialogContent>
                              </Dialog>
                              <FoodForm 
                                food={food} 
                                onSubmit={(data) => editFood(food.id!, data)}
                                buttonText={<Edit className="h-4 w-4" />}
                              />
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => removeFood(food.id!)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="mb-4 rounded-full bg-muted p-3">
                          <Plus className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-lg font-medium">No custom foods yet</h3>
                        <p className="mb-4 text-sm text-muted-foreground">Add your own foods to make tracking easier</p>
                        <FoodForm onSubmit={addFood} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="database" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Database Foods</CardTitle>
                    <CardDescription>Foods from external databases (USDA, etc.)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {databaseFoods.length > 0 ? (
                      <div className="grid gap-4">
                        {databaseFoods.map((food) => (
                          <div key={food.id} className="flex items-center justify-between p-4 border rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{food.name}</h3>
                                <Badge variant="secondary">{food.source}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <span>Serving: {food.serving_size_gram}g</span>
                                {(food.calories || 0) > 0 && (
                                  <span className="ml-4">
                                    {food.calories} cal | {food.protein}g protein | {food.carbs}g carbs | {food.fat}g fat
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Beaker className="h-4 w-4 mr-1" />
                                    View Nutrition
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Nutrition Information - {food.name}</DialogTitle>
                                  </DialogHeader>
                                  <NutritionForm
                                    food={food}
                                    nutrients={nutrients}
                                    onAddNutrient={addFoodNutrient}
                                    onUpdateNutrient={editFoodNutrient}
                                    onRemoveNutrient={removeFoodNutrient}
                                  />
                                </DialogContent>
                              </Dialog>
                              <Button 
                                size="sm"
                                onClick={() => {
                                  // Add to meal functionality here
                                  console.log('Add to meal:', food)
                                }}
                              >
                                Add to Meal
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="mb-4 rounded-full bg-muted p-3">
                          <Utensils className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-lg font-medium">No database foods yet</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                          Database foods will appear here when they're added to the system
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>            </Tabs>
          </div>
        </div>
      </main>
      </div>
    </ProtectedRoute>
  )
}
