'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Calendar, Clock, Utensils, Calculator, Edit, Trash2, RefreshCw, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import { useMealLogs } from '../hooks/useMealLogs'
import { MealLogItemsManager } from './MealLogItemsManager'
import { MealNutritionDisplay } from './MealNutritionDisplay'
import { MealEditForm } from './MealEditForm'
import { MealLog, MealType } from '../types'

interface MealLogDetailViewProps {
  mealLogId: number
  showBackButton?: boolean
  onBack?: () => void
}

export const MealLogDetailView: React.FC<MealLogDetailViewProps> = ({
  mealLogId,
  showBackButton = true,
  onBack
}) => {
  const [mealLog, setMealLog] = useState<MealLog | null>(null)
  const [activeTab, setActiveTab] = useState('items')
  const router = useRouter()
  const { toast } = useToast()

  const {
    fetchMealLogById,
    deleteMealLog,
    loading,
    error,
    clearError
  } = useMealLogs()

  // Load meal log details
  useEffect(() => {
    loadMealLog()
  }, [mealLogId])

  const loadMealLog = async () => {
    try {
      const meal = await fetchMealLogById(mealLogId)
      setMealLog(meal)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load meal log details",
        variant: "destructive"
      })
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const handleDeleteMeal = async () => {
    if (!window.confirm('Are you sure you want to delete this entire meal log? This action cannot be undone.')) {
      return
    }

    try {
      await deleteMealLog(mealLogId)
      toast({
        title: "Success",
        description: "Meal log deleted successfully"
      })
      handleBack()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete meal log",
        variant: "destructive"
      })
    }
  }

  const handleMealUpdated = () => {
    loadMealLog()
    toast({
      title: "Success",
      description: "Meal log updated successfully"
    })
  }

  if (loading && !mealLog) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading meal details...</p>
        </div>
      </div>
    )
  }

  if (error && !mealLog) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
            <Button variant="outline" size="sm" onClick={loadMealLog}>
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (!mealLog) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Meal log not found.
        </AlertDescription>
      </Alert>
    )
  }

  const getMealTypeColor = (mealType: MealType): string => {
    switch (mealType) {
      case 'Breakfast': return 'bg-yellow-100 text-yellow-800'
      case 'Lunch': return 'bg-blue-100 text-blue-800'
      case 'Dinner': return 'bg-purple-100 text-purple-800'
      case 'Snacks': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              {showBackButton && (
                <Button variant="ghost" size="sm" onClick={handleBack} className="p-0 h-auto">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Meals
                </Button>
              )}
              
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Meal Details</h1>
                <Badge className={getMealTypeColor(mealLog.meal_type)}>
                  {mealLog.meal_type}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(mealLog.created_at), 'MMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {format(new Date(mealLog.created_at), 'h:mm a')}
                </div>
                <div className="flex items-center gap-1">
                  <Utensils className="h-4 w-4" />
                  {mealLog.items?.length || 0} items
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMealLog}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              
              <MealEditForm
                meal={mealLog}
                onSubmit={async (id, data) => {
                  // This will be handled by the MealEditForm component
                  handleMealUpdated()
                }}
                trigger={
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                }
              />
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteMeal}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Quick Stats */}
        {(mealLog.total_calories || mealLog.total_protein || mealLog.total_carbs || mealLog.total_fat) && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mealLog.total_calories && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{mealLog.total_calories}</div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                </div>
              )}
              {mealLog.total_protein && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{mealLog.total_protein}g</div>
                  <div className="text-sm text-muted-foreground">Protein</div>
                </div>
              )}
              {mealLog.total_carbs && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{mealLog.total_carbs}g</div>
                  <div className="text-sm text-muted-foreground">Carbs</div>
                </div>
              )}
              {mealLog.total_fat && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{mealLog.total_fat}g</div>
                  <div className="text-sm text-muted-foreground">Fat</div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="items">Food Items</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <MealLogItemsManager 
            mealLogId={mealLogId}
            showNutrition={false}
          />
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <MealNutritionDisplay 
            mealLogId={mealLogId}
            autoFetch={activeTab === 'nutrition'}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 