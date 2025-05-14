import Link from "next/link"
import { CalendarDays, ChevronRight, PieChart, Plus, Utensils, Weight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DailyNutritionChart } from "@/components/daily-nutrition-chart"
import { MealEntry } from "@/components/meal-entry"
import { RecentExercises } from "@/components/recent-exercises"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-green-600" />
            <h1 className="text-xl font-bold">NutriTrack</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-foreground">
              Dashboard
            </Link>
            <Link href="/food" className="text-sm font-medium text-muted-foreground">
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
            <Button variant="ghost" size="icon" className="rounded-full">
              <img
                src="/placeholder.svg?height=32&width=32"
                alt="Avatar"
                className="rounded-full"
                height={32}
                width={32}
              />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Daily Summary</CardTitle>
                  <CardDescription>Your nutrition intake for today</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Food
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">Calories</div>
                        <div className="text-sm text-muted-foreground">1,245 / 2,000 kcal</div>
                      </div>
                      <div className="text-sm font-medium">62%</div>
                    </div>
                    <Progress value={62} className="h-2" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Protein</div>
                        <div className="text-sm text-muted-foreground">75g / 150g</div>
                      </div>
                      <Progress value={50} className="h-2" indicatorColor="bg-blue-500" />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Carbs</div>
                        <div className="text-sm text-muted-foreground">145g / 250g</div>
                      </div>
                      <Progress value={58} className="h-2" indicatorColor="bg-yellow-500" />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Fat</div>
                        <div className="text-sm text-muted-foreground">45g / 65g</div>
                      </div>
                      <Progress value={69} className="h-2" indicatorColor="bg-red-500" />
                    </div>
                  </div>
                  <div className="h-[200px] w-full">
                    <DailyNutritionChart />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Health Metrics</CardTitle>
                <CardDescription>Track your progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <Weight className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Weight</p>
                      <p className="text-sm text-muted-foreground">165 lbs</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <PieChart className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Body Fat</p>
                      <p className="text-sm text-muted-foreground">18%</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Link href="/metrics" className="flex items-center text-sm text-green-600 hover:underline">
                    View all metrics
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Today's Meals</CardTitle>
                  <CardDescription>Your food intake for today</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Meal
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <MealEntry
                    title="Breakfast"
                    time="7:30 AM"
                    calories={450}
                    protein={25}
                    carbs={45}
                    fat={15}
                    items={[
                      { name: "Oatmeal with berries", calories: 320 },
                      { name: "Greek yogurt", calories: 130 },
                    ]}
                  />
                  <MealEntry
                    title="Lunch"
                    time="12:15 PM"
                    calories={650}
                    protein={35}
                    carbs={75}
                    fat={20}
                    items={[
                      { name: "Grilled chicken salad", calories: 450 },
                      { name: "Whole grain bread", calories: 120 },
                      { name: "Apple", calories: 80 },
                    ]}
                  />
                  <MealEntry
                    title="Snack"
                    time="3:30 PM"
                    calories={145}
                    protein={15}
                    carbs={25}
                    fat={10}
                    items={[{ name: "Protein shake", calories: 145 }]}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Exercise</CardTitle>
                <CardDescription>Your activity for the week</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentExercises />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
