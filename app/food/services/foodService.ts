import api from '@/lib/api-client';
import { Food, CreateFood, FoodNutrient, CreateFoodNutrient, Nutrient, FoodWithNutrition } from '../types';

// Food CRUD operations
export const createFood = async (food: CreateFood): Promise<Food> => {
  try {
    const response = await api.post('/foods', food);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error('Invalid food data provided');
    }
    throw new Error('Failed to create food');
  }
};

export const getAllFoods = async (): Promise<Food[]> => {
  try {
    const response = await api.get('/foods');
    return response.data;
  } catch (error) {
    throw new Error('Failed to retrieve foods');
  }
};

export const getFoodById = async (id: number): Promise<Food> => {
  try {
    const response = await api.get(`/foods/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Food not found');
    }
    throw new Error('Failed to retrieve food');
  }
};

export const updateFood = async (id: number, food: CreateFood): Promise<Food> => {
  try {
    const response = await api.put(`/foods/${id}`, food);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Food not found');
    }
    throw new Error('Failed to update food');
  }
};

export const deleteFood = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/foods/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Food not found');
    }
    throw new Error('Failed to delete food');
  }
};

// Food Nutrient operations
export const getFoodNutrients = async (foodId: number): Promise<FoodNutrient[]> => {
  try {
    const response = await api.get(`/food-nutrients/food/${foodId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to retrieve food nutrients');
  }
};

export const createFoodNutrient = async (foodNutrient: CreateFoodNutrient): Promise<FoodNutrient> => {
  try {
    const response = await api.post('/food-nutrients', foodNutrient);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create food nutrient');
  }
};

export const updateFoodNutrient = async (id: number, foodNutrient: CreateFoodNutrient): Promise<FoodNutrient> => {
  try {
    const response = await api.put(`/food-nutrients/${id}`, foodNutrient);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update food nutrient');
  }
};

export const deleteFoodNutrient = async (id: number): Promise<void> => {
  try {
    await api.delete(`/food-nutrients/${id}`);
  } catch (error) {
    throw new Error('Failed to delete food nutrient');
  }
};

// Nutrient operations
export const getAllNutrients = async (): Promise<Nutrient[]> => {
  try {
    const response = await api.get('/nutrients');
    return response.data;
  } catch (error) {
    throw new Error('Failed to retrieve nutrients');
  }
};

export const getNutrientsByCategory = async (category: string): Promise<Nutrient[]> => {
  try {
    const response = await api.get(`/nutrients/category/${category}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to retrieve nutrients by category');
  }
};

// Helper function to get food with nutrition data
export const getFoodWithNutrition = async (foodId: number): Promise<FoodWithNutrition> => {
  try {
    const [food, nutrients] = await Promise.all([
      getFoodById(foodId),
      getFoodNutrients(foodId)
    ]);

    // Calculate basic nutrition values from nutrients
    const calories = nutrients.find(n => n.nutrient?.name === 'Calories')?.amount_per_100g || 0;
    const protein = nutrients.find(n => n.nutrient?.name === 'Protein')?.amount_per_100g || 0;
    const carbs = nutrients.find(n => n.nutrient?.name === 'Carbohydrates')?.amount_per_100g || 0;
    const fat = nutrients.find(n => n.nutrient?.name === 'Fat')?.amount_per_100g || 0;

    return {
      ...food,
      calories,
      protein,
      carbs,
      fat,
      nutrients
    };
  } catch (error) {
    throw new Error('Failed to retrieve food with nutrition data');
  }
};

// Helper function to get multiple foods with nutrition data
export const getFoodsWithNutrition = async (foodIds?: number[]): Promise<FoodWithNutrition[]> => {
  try {
    const foods = await getAllFoods();
    const targetFoods = foodIds ? foods.filter(f => foodIds.includes(f.id!)) : foods;
    
    const foodsWithNutrition = await Promise.all(
      targetFoods.map(async (food) => {
        try {
          const nutrients = await getFoodNutrients(food.id!);
          
          // Calculate basic nutrition values from nutrients
          const calories = nutrients.find(n => n.nutrient?.name === 'Calories')?.amount_per_100g || 0;
          const protein = nutrients.find(n => n.nutrient?.name === 'Protein')?.amount_per_100g || 0;
          const carbs = nutrients.find(n => n.nutrient?.name === 'Carbohydrates')?.amount_per_100g || 0;
          const fat = nutrients.find(n => n.nutrient?.name === 'Fat')?.amount_per_100g || 0;

          return {
            ...food,
            calories,
            protein,
            carbs,
            fat,
            nutrients
          };
        } catch (error) {
          // If we can't get nutrients, return food with zero nutrition
          return {
            ...food,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            nutrients: []
          };
        }
      })
    );

    return foodsWithNutrition;
  } catch (error) {
    throw new Error('Failed to retrieve foods with nutrition data');
  }
};