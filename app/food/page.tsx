"use client"

import Link from "next/link"
import { CalendarDays, ChevronDown, Filter, Plus, Search, Utensils, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FoodItem } from "@/components/food-item"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"

export default function FoodPage() {
  const { user, logout } = useAuth()
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
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Food
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search foods..." className="pl-8" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="hidden sm:flex">
                Recent
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
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
                    <CardTitle>Common Foods</CardTitle>
                    <CardDescription>Select a food to add to your diary</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <FoodItem name="Chicken Breast" serving="100g" calories={165} protein={31} carbs={0} fat={3.6} />
                      <FoodItem
                        name="Brown Rice"
                        serving="100g cooked"
                        calories={112}
                        protein={2.6}
                        carbs={23}
                        fat={0.9}
                      />
                      <FoodItem name="Avocado" serving="1 medium" calories={240} protein={3} carbs={12} fat={22} />
                      <FoodItem name="Salmon" serving="100g" calories={208} protein={20} carbs={0} fat={13} />
                      <FoodItem
                        name="Sweet Potato"
                        serving="1 medium"
                        calories={112}
                        protein={2}
                        carbs={26}
                        fat={0.1}
                      />
                      <FoodItem name="Greek Yogurt" serving="170g" calories={100} protein={17} carbs={6} fat={0.7} />
                      <FoodItem name="Spinach" serving="100g" calories={23} protein={2.9} carbs={3.6} fat={0.4} />
                      <FoodItem name="Banana" serving="1 medium" calories={105} protein={1.3} carbs={27} fat={0.4} />
                    </div>
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
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Custom Food
                      </Button>
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
