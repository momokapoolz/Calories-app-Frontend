import Link from "next/link"
import { CalendarDays, ChevronDown, Filter, Plus, Search, Utensils } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExerciseItem } from "@/components/exercise-item"

export default function ExercisePage() {
  return (
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
            <Link href="/food" className="text-sm font-medium text-muted-foreground">
              Food
            </Link>
            <Link href="/exercise" className="text-sm font-medium text-foreground">
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
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Exercise Database</h1>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Exercise
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search exercises..." className="pl-8" />
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
                <TabsTrigger value="all">All Exercises</TabsTrigger>
                <TabsTrigger value="cardio">Cardio</TabsTrigger>
                <TabsTrigger value="strength">Strength</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Common Exercises</CardTitle>
                    <CardDescription>Select an exercise to add to your diary</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <ExerciseItem name="Running" category="Cardio" caloriesPerHour={600} duration={30} />
                      <ExerciseItem name="Cycling" category="Cardio" caloriesPerHour={500} duration={45} />
                      <ExerciseItem name="Swimming" category="Cardio" caloriesPerHour={700} duration={30} />
                      <ExerciseItem name="Weight Lifting" category="Strength" caloriesPerHour={400} duration={60} />
                      <ExerciseItem name="Yoga" category="Flexibility" caloriesPerHour={300} duration={60} />
                      <ExerciseItem name="HIIT Workout" category="Cardio" caloriesPerHour={800} duration={20} />
                      <ExerciseItem name="Walking" category="Cardio" caloriesPerHour={300} duration={45} />
                      <ExerciseItem name="Pilates" category="Strength" caloriesPerHour={350} duration={45} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="cardio" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Cardio Exercises</CardTitle>
                    <CardDescription>Cardiovascular exercises</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <ExerciseItem name="Running" category="Cardio" caloriesPerHour={600} duration={30} />
                      <ExerciseItem name="Cycling" category="Cardio" caloriesPerHour={500} duration={45} />
                      <ExerciseItem name="Swimming" category="Cardio" caloriesPerHour={700} duration={30} />
                      <ExerciseItem name="HIIT Workout" category="Cardio" caloriesPerHour={800} duration={20} />
                      <ExerciseItem name="Walking" category="Cardio" caloriesPerHour={300} duration={45} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="strength" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Strength Exercises</CardTitle>
                    <CardDescription>Strength and resistance training</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <ExerciseItem name="Weight Lifting" category="Strength" caloriesPerHour={400} duration={60} />
                      <ExerciseItem name="Push-ups" category="Strength" caloriesPerHour={350} duration={15} />
                      <ExerciseItem name="Squats" category="Strength" caloriesPerHour={400} duration={15} />
                      <ExerciseItem name="Deadlifts" category="Strength" caloriesPerHour={450} duration={30} />
                      <ExerciseItem name="Bench Press" category="Strength" caloriesPerHour={380} duration={30} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="recent" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Exercises</CardTitle>
                    <CardDescription>Exercises you've recently added to your diary</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <ExerciseItem name="Running" category="Cardio" caloriesPerHour={600} duration={30} />
                      <ExerciseItem name="Weight Lifting" category="Strength" caloriesPerHour={400} duration={60} />
                      <ExerciseItem name="Yoga" category="Flexibility" caloriesPerHour={300} duration={60} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
