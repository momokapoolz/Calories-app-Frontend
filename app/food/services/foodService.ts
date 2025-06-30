import axios from 'axios';
import { Food, CreateFood, FoodNutrient, CreateFoodNutrient, Nutrient, FoodWithNutrition } from '../types';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Food CRUD operations
export const createFood = async (food: CreateFood): Promise<Food> => {
  try {
    const response = await axios.post('/api/foods', food, {
      headers: getAuthHeaders()
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid food data provided');
    }
    throw new Error(error.response?.data?.message || 'Failed to create food');
  }
};

export const getAllFoods = async (): Promise<Food[]> => {
  console.log('[getAllFoods] Fetching from:', '/api/foods');
  try {
    const response = await axios.get<any>('/api/foods', {
      headers: getAuthHeaders()
    });
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
    const response = await axios.get(`/api/foods/${id}`, {
      headers: getAuthHeaders()
    });
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
    const response = await axios.put(`/api/foods/${id}`, food, {
      headers: getAuthHeaders()
    });
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
    await axios.delete(`/api/foods/${id}`, {
      headers: getAuthHeaders()
    });
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
    const response = await axios.get(`/api/food-nutrients/food/${foodId}`, {
      headers: getAuthHeaders()
    });
    const data = response.data.data;
    // Ensure we always return an array
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.warn(`Failed to retrieve nutrients for food ID ${foodId}:`, error.response?.data?.message || error.message);
    // Return empty array instead of throwing to prevent breaking the parent function
    return [];
  }
};

export const createFoodNutrient = async (foodNutrient: CreateFoodNutrient): Promise<FoodNutrient> => {
  try {
    const response = await axios.post('/api/food-nutrients', foodNutrient, {
      headers: getAuthHeaders()
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create food nutrient');
  }
};

export const updateFoodNutrient = async (id: number, foodNutrient: CreateFoodNutrient): Promise<FoodNutrient> => {
  try {
    const response = await axios.put(`/api/food-nutrients/${id}`, foodNutrient, {
      headers: getAuthHeaders()
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update food nutrient');
  }
};

export const deleteFoodNutrient = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/api/food-nutrients/${id}`, {
      headers: getAuthHeaders()
    });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete food nutrient');
  }
};

// Nutrient operations
export const getAllNutrients = async (): Promise<Nutrient[]> => {
  try {
    const response = await axios.get('/api/nutrients', {
      headers: getAuthHeaders()
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to retrieve nutrients');
  }
};

export const getNutrientsByCategory = async (category: string): Promise<Nutrient[]> => {
  try {
    const response = await axios.get(`/api/nutrients/category/${category}`, {
      headers: getAuthHeaders()
    });
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

    // Ensure nutrients is an array before calling .find()
    const nutrientsArray = Array.isArray(nutrients) ? nutrients : [];
    
    // Calculate basic nutrition values from nutrients with additional null checks
    const calories = nutrientsArray.find(n => n?.nutrient?.name === 'Calories')?.amount_per_100g || 0;
    const protein = nutrientsArray.find(n => n?.nutrient?.name === 'Protein')?.amount_per_100g || 0;
    const carbs = nutrientsArray.find(n => n?.nutrient?.name === 'Carbohydrates')?.amount_per_100g || 0;
    const fat = nutrientsArray.find(n => n?.nutrient?.name === 'Fat')?.amount_per_100g || 0;

    return {
      ...food,
      calories,
      protein,
      carbs,
      fat,
      nutrients: nutrientsArray
    };
  } catch (error) {
    throw new Error('Failed to retrieve food with nutrition data');
  }
};

// Helper function to get multiple foods with nutrition data
export const getFoodsWithNutrition = async (foodIds?: number[], lazyLoadNutrition = false): Promise<FoodWithNutrition[]> => {
  console.log('[getFoodsWithNutrition] Starting...');
  try {
    const foods = await getAllFoods();
    console.log('[getFoodsWithNutrition] Foods from getAllFoods:', foods.length, 'foods');

    if (!Array.isArray(foods)) {
      console.error('[getFoodsWithNutrition] getAllFoods did not return an array. Data:', foods);
      throw new Error('Data from getAllFoods is not an array.');
    }

    const targetFoods = foodIds ? foods.filter(f => foodIds.includes(f.id!)) : foods;
    console.log('[getFoodsWithNutrition] Target foods to process:', targetFoods.length, 'foods');
    
    // If lazy loading is enabled, return foods without nutrition data initially
    if (lazyLoadNutrition) {
      console.log('[getFoodsWithNutrition] Lazy loading enabled - returning foods without nutrition data');
      return targetFoods.map(food => ({
        ...food,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        nutrients: []
      }));
    }
    
    // Batch process foods in smaller chunks to avoid overwhelming the API
    const BATCH_SIZE = 10; // Process 10 foods at a time
    const allFoodsWithNutrition: FoodWithNutrition[] = [];
    
    for (let i = 0; i < targetFoods.length; i += BATCH_SIZE) {
      const batch = targetFoods.slice(i, i + BATCH_SIZE);
      console.log(`[getFoodsWithNutrition] Processing batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(targetFoods.length/BATCH_SIZE)} (${batch.length} foods)`);
      
      const batchResults = await Promise.all(
        batch.map(async (food) => {
        if (typeof food?.id === 'undefined') {
          console.error('[getFoodsWithNutrition] Encountered food item with undefined ID:', food);
          return {
            ...(food || {}),
              id: -1,
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
            
            // Ensure nutrients is an array
            const nutrientsArray = Array.isArray(nutrients) ? nutrients : [];
          
          // Calculate basic nutrition values from nutrients
            const calories = nutrientsArray.find(n => n?.nutrient?.name === 'Calories')?.amount_per_100g || 0;
            const protein = nutrientsArray.find(n => n?.nutrient?.name === 'Protein')?.amount_per_100g || 0;
            const carbs = nutrientsArray.find(n => n?.nutrient?.name === 'Carbohydrates')?.amount_per_100g || 0;
            const fat = nutrientsArray.find(n => n?.nutrient?.name === 'Fat')?.amount_per_100g || 0;

          return {
            ...food,
            calories,
            protein,
            carbs,
            fat,
              nutrients: nutrientsArray
          };
        } catch (error: any) {
            console.warn(`[getFoodsWithNutrition] Error processing food ID ${food?.id}:`, error.message);
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

      allFoodsWithNutrition.push(...batchResults);
      
      // Add a small delay between batches to avoid overwhelming the API
      if (i + BATCH_SIZE < targetFoods.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('[getFoodsWithNutrition] Successfully processed', allFoodsWithNutrition.length, 'foods with nutrition');
    return allFoodsWithNutrition;
  } catch (error: any) {
    console.error('[getFoodsWithNutrition] Outer catch error:', error.message);
    throw new Error(`Failed to retrieve foods with nutrition data. Original error: ${error.message}`);
  }
};