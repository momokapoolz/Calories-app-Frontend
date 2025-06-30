# Meal Nutrition Feature Implementation

## Overview
This feature integrates the nutrition API to display real-time nutrition data (protein, carbs, fat) for each meal instead of hardcoded zeros.

## How It Works

### API Integration
- **Endpoint**: `/api/v1/nutrition/meal/{mealLogId}`
- **Method**: GET
- **Authentication**: Required (Bearer token)
- **Response**: Detailed nutrition breakdown including macro and micro nutrients

### Frontend Implementation

#### 1. Custom Hook: `useMealNutrition`
Located in `app/meal/hooks/useMealNutrition.ts`

**Features:**
- `useMealNutrition(mealLogId)` - Fetch nutrition for a single meal
- `useMultipleMealNutrition(mealLogIds[])` - Fetch nutrition for multiple meals in parallel
- Automatic loading states and error handling
- Simplified nutrition summary extraction

#### 2. Dashboard Integration
Updated `app/dashboard/page.tsx` to:
- Extract meal log IDs from dashboard data
- Use `useMultipleMealNutrition` hook to fetch nutrition for all meals
- Pass real nutrition data to `MealEntry` components
- Handle loading states for both dashboard and nutrition data

#### 3. Enhanced MealEntry Component
Updated `components/meal-entry.tsx` to:
- Accept `nutritionLoading` prop
- Display loading indicator while nutrition data is being fetched
- Show actual protein, carbs, and fat values

## Data Flow

```mermaid
graph LR
    A[Dashboard] --> B[Fetch Meals]
    B --> C[Extract Meal IDs]
    C --> D[useMultipleMealNutrition Hook]
    D --> E[Parallel API Calls]
    E --> F[/api/nutrition/meal/{id}]
    F --> G[Backend API]
    G --> H[Nutrition Data]
    H --> I[MealEntry Components]
    I --> J[Display Real Nutrition]
```

## Key Benefits

1. **Real Data**: Shows actual nutritional information instead of zeros
2. **Performance**: Parallel API calls for multiple meals
3. **User Experience**: Loading states and error handling
4. **Scalability**: Reusable hooks for other components

## Usage Example

```typescript
// For a single meal
const { nutrition, loading, error, summary } = useMealNutrition(mealLogId);

// For multiple meals
const { nutritionMap, loading, getNutritionForMeal } = useMultipleMealNutrition(mealLogIds);

// Get nutrition for specific meal
const nutrition = getNutritionForMeal(mealLogId);
```

## API Response Structure

```json
{
  "meal_log_id": 123,
  "user_id": 1,
  "meal_type": "breakfast",
  "date": "2024-01-15",
  "total_calories": 450.2,
  "food_count": 3,
  "MacroNutrientBreakDown": [
    {
      "energy": 450.2,
      "protein": 25.1,
      "total_lipid_fe": 18.7,
      "carbohydrate": 60.3,
      "fiber": 8.2
    }
  ],
  "MicroNutrientBreakDown": [
    {
      "nutrient_id": 11,
      "nutrient_name": "Vitamin C",
      "amount": 25.3,
      "unit": "g"
    }
  ]
}
```

## Testing

To test this feature:
1. Ensure you have meal logs with associated food items
2. Visit the dashboard page
3. Observe that meals now show real nutrition data instead of zeros
4. Check for loading indicators while data is being fetched
5. Verify error handling for failed API calls

## Future Enhancements

1. Cache nutrition data to reduce API calls
2. Add refresh functionality for nutrition data
3. Display micro nutrients in a detailed view
4. Add nutrition goals comparison per meal
5. Implement nutrition data editing/override capabilities 