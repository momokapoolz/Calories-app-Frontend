"use client"

import Link from "next/link"
import { CalendarDays, ChevronDown, Filter, Plus, Search, Utensils, LogOut, Trash2, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FoodItem } from "@/components/food-item"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useFood } from "./hooks/useFood"
import { FoodForm } from "./components/FoodForm"
import { useState } from "react"

export default function FoodPage() {
  const { user, logout } = useAuth()
  const { foods, loading, error, addFood, editFood, removeFood } = useFood()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-green-600" />
            <h1 className="text-xl font-bold">NutriTrack</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground">
              Dashboard
            </Link>
            <Link href="/food" className="text-sm font-medium text-foreground">
              Food
            </Link>
            <Link href="/exercise" className="text-sm font-medium text-muted-foreground">
              Exercise
            </Link>
            <Link href="/reports" className="text-sm font-medium text-muted-foreground">
              Reports
            </Link>
            <Link href="/settings" className="text-sm font-medium text-muted-foreground">
              Settings
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <CalendarDays className="mr-2 h-4 w-4" />
              Today
            </Button>
            <div className="flex items-center gap-2">
              {user && <span className="text-sm font-medium">{user.name}</span>}
              <Button variant="ghost" size="icon" className="rounded-full">
                <img
                  src="/placeholder.svg?height=32&width=32"
                  alt="Avatar"
                  className="rounded-full"
                  height={32}
                  width={32}
                />
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
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
              <Button variant="outline" className="hidden sm:flex">
                Recent
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Foods</TabsTrigger>
                <TabsTrigger value="my-foods">My Foods</TabsTrigger>
                <TabsTrigger value="recipes">Recipes</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>All Foods</CardTitle>
                    <CardDescription>Select a food to add to your diary</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-4">Loading...</div>
                    ) : filteredFoods.length > 0 ? (
                      <div className="grid gap-4">
                        {filteredFoods.map((food) => (
                          <div key={food.id} className="flex items-center justify-between p-4 border rounded">
                            <div>
                              <h3 className="font-medium">{food.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Serving: {food.serving_size_gram}g | Source: {food.source}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <FoodForm 
                                food={food} 
                                onSubmit={(data) => editFood(food.id!, data)}
                                buttonText={<Edit className="h-4 w-4" />}
                              />
                              <Button 
                                variant="destructive" 
                                size="icon"
                                onClick={() => removeFood(food.id!)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">No foods found</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="my-foods" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Custom Foods</CardTitle>
                    <CardDescription>Foods you've added to your database</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="mb-4 rounded-full bg-muted p-3">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="mb-2 text-lg font-medium">No custom foods yet</h3>
                      <p className="mb-4 text-sm text-muted-foreground">Add your own foods to make tracking easier</p>
                      <FoodForm onSubmit={addFood} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="recipes" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Recipes</CardTitle>
                    <CardDescription>Recipes you've created</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="mb-4 rounded-full bg-muted p-3">
                        <Utensils className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="mb-2 text-lg font-medium">No recipes yet</h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Create recipes to easily track meals you eat often
                      </p>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Recipe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="recent" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recently Used Foods</CardTitle>
                    <CardDescription>Foods you've recently added to your diary</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <FoodItem
                        name="Oatmeal with berries"
                        serving="1 bowl"
                        calories={320}
                        protein={12}
                        carbs={54}
                        fat={6}
                      />
                      <FoodItem
                        name="Grilled chicken salad"
                        serving="1 plate"
                        calories={450}
                        protein={35}
                        carbs={25}
                        fat={22}
                      />
                      <FoodItem name="Protein shake" serving="1 shake" calories={145} protein={25} carbs={9} fat={2} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}
