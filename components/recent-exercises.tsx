import { Activity, Bike, Dumbbell, Footprints, ShowerHeadIcon as SwimmingPool } from "lucide-react"

export function RecentExercises() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-green-100 p-2">
          <Footprints className="h-4 w-4 text-green-600" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">Running</p>
          <div className="flex items-center text-xs text-muted-foreground">
            <span>Yesterday • 30 min • 300 kcal</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-blue-100 p-2">
          <Dumbbell className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">Weight Training</p>
          <div className="flex items-center text-xs text-muted-foreground">
            <span>Monday • 45 min • 250 kcal</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-purple-100 p-2">
          <Bike className="h-4 w-4 text-purple-600" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">Cycling</p>
          <div className="flex items-center text-xs text-muted-foreground">
            <span>Sunday • 60 min • 450 kcal</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-cyan-100 p-2">
          <SwimmingPool className="h-4 w-4 text-cyan-600" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">Swimming</p>
          <div className="flex items-center text-xs text-muted-foreground">
            <span>Saturday • 40 min • 400 kcal</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-orange-100 p-2">
          <Activity className="h-4 w-4 text-orange-600" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">HIIT Workout</p>
          <div className="flex items-center text-xs text-muted-foreground">
            <span>Friday • 25 min • 350 kcal</span>
          </div>
        </div>
      </div>
    </div>
  )
}
