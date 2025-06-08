import api from '@/lib/api-client';
import { Food, CreateFood, FoodNutrient, CreateFoodNutrient, Nutrient, FoodWithNutrition } from '../types';

// Base API path
const API_PATH = '/api/v1';

// Food CRUD operations
export const createFood = async (food: CreateFood): Promise<Food> => {
  try {
    const response = await api.post(`${API_PATH}/foods`, food);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid food data provided');
    }
    throw new Error(error.response?.data?.message || 'Failed to create food');
  }
};

export const getAllFoods = async (): Promise<Food[]> => {
  console.log('[getAllFoods] Fetching from:', `${API_PATH}/foods/`);
  try {
    const response = await api.get<any>(`${API_PATH}/foods/`); // Specify <any> or a more specific type for response.data
    console.log('[getAllFoods] Response status:', response.status);
    console.log('[getAllFoods] Raw response.data:', JSON.stringify(response.data, null, 2));

    // Assuming the actual food array is nested under a 'data' key in the response, as per original code
    // It's good practice to check if response.data and response.data.data exist and are of expected type
    if (response.data && Array.isArray(response.data.data)) {
      console.log('[getAllFoods] Successfully extracted food array from response.data.data.');
      return response.data.data as Food[];
    } else if (response.data && Array.isArray(response.data)) {
      // Fallback if the data is not nested under another 'data' key but is the root array
      console.warn('[getAllFoods] response.data is an array, not response.data.data. Using response.data directly.');
      return response.data as Food[];
    } else {
      console.error('[getAllFoods] Expected an array of foods in response.data.data or response.data, but got:', response.data);
      throw new Error('Food data received from API is not in the expected format.');
    }
  } catch (error: any) {
    console.error('[getAllFoods] API Error - Status:', error.response?.status, 'Response Data:', JSON.stringify(error.response?.data, null, 2));
    const message = error.response?.data?.message || error.message || 'Unknown error while fetching foods';
    throw new Error(`Failed to retrieve foods. Status: ${error.response?.status || 'N/A'}. Message: ${message}`);
  }
};

export const getFoodById = async (id: number): Promise<Food> => {
  try {
    const response = await api.get(`${API_PATH}/foods/${id}/`);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Food not found');
    }
    throw new Error(error.response?.data?.message || 'Failed to retrieve food');
  }
};

export const updateFood = async (id: number, food: CreateFood): Promise<Food> => {
  try {
    const response = await api.put(`${API_PATH}/foods/${id}/`, food);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Food not found');
    }
    throw new Error(error.response?.data?.message || 'Failed to update food');
  }
};

export const deleteFood = async (id: number): Promise<void> => {
  try {
    await api.delete(`${API_PATH}/foods/${id}/`);
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Food not found');
    }
    throw new Error(error.response?.data?.message || 'Failed to delete food');
  }
};

// Food Nutrient operations
export const getFoodNutrients = async (foodId: number): Promise<FoodNutrient[]> => {
  try {
    const response = await api.get(`${API_PATH}/food-nutrients/food/${foodId}/`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to retrieve food nutrients');
  }
};

export const createFoodNutrient = async (foodNutrient: CreateFoodNutrient): Promise<FoodNutrient> => {
  try {
    const response = await api.post(`${API_PATH}/food-nutrients/`, foodNutrient);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create food nutrient');
  }
};

export const updateFoodNutrient = async (id: number, foodNutrient: CreateFoodNutrient): Promise<FoodNutrient> => {
  try {
    const response = await api.put(`${API_PATH}/food-nutrients/${id}/`, foodNutrient);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update food nutrient');
  }
};

export const deleteFoodNutrient = async (id: number): Promise<void> => {
  try {
    await api.delete(`${API_PATH}/food-nutrients/${id}/`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete food nutrient');
  }
};

// Nutrient operations
export const getAllNutrients = async (): Promise<Nutrient[]> => {
  try {
    const response = await api.get(`${API_PATH}/nutrients/`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to retrieve nutrients');
  }
};

export const getNutrientsByCategory = async (category: string): Promise<Nutrient[]> => {
  try {
    const response = await api.get(`${API_PATH}/nutrients/category/${category}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to retrieve nutrients by category');
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
  console.log('[getFoodsWithNutrition] Starting...');
  try {
    const foods = await getAllFoods();
    console.log('[getFoodsWithNutrition] Foods from getAllFoods:', JSON.stringify(foods, null, 2));

    if (!Array.isArray(foods)) {
      console.error('[getFoodsWithNutrition] getAllFoods did not return an array. Data:', foods);
      throw new Error('Data from getAllFoods is not an array.');
    }

    const targetFoods = foodIds ? foods.filter(f => foodIds.includes(f.id!)) : foods;
    console.log('[getFoodsWithNutrition] Target foods to process:', JSON.stringify(targetFoods, null, 2));
    
    const foodsWithNutrition = await Promise.all(
      targetFoods.map(async (food) => {
        console.log(`[getFoodsWithNutrition] Processing food ID: ${food?.id}`);
        if (typeof food?.id === 'undefined') {
          console.error('[getFoodsWithNutrition] Encountered food item with undefined ID:', food);
          // Skip this item or handle as an error, returning a default structure
          return {
            ...(food || {}),
            id: -1, // Placeholder ID
            name: food?.name || 'Unknown Food (ID missing)',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            nutrients: []
          };
        }
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
        } catch (error: any) {
          console.error(`[getFoodsWithNutrition] Error fetching nutrients for food ID ${food?.id}:`, error.message);
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

    console.log('[getFoodsWithNutrition] Successfully processed foodsWithNutrition:', JSON.stringify(foodsWithNutrition, null, 2));
    return foodsWithNutrition;
  } catch (error: any) {
    console.error('[getFoodsWithNutrition] Outer catch error:', error.message, error.stack);
    throw new Error(`Failed to retrieve foods with nutrition data. Original error: ${error.message}`);
  }
};