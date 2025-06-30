import { useState, useEffect, useCallback } from 'react';
import { 
  Food, 
  CreateFood, 
  FoodWithNutrition,
  Nutrient,
  FoodNutrient,
  CreateFoodNutrient
} from '../types';
import {
  createFood,
  getAllFoods,
  getFoodById,
  updateFood,
  deleteFood,
  getFoodsWithNutrition,
  getFoodWithNutrition,
  getAllNutrients,
  getFoodNutrients,
  createFoodNutrient,
  updateFoodNutrient,
  deleteFoodNutrient
} from '../services/foodService';

export const useFood = () => {
  const [foods, setFoods] = useState<FoodWithNutrition[]>([]);
  const [nutrients, setNutrients] = useState<Nutrient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all foods with nutrition data - memoized to prevent infinite re-renders
  const fetchFoods = useCallback(async (lazyLoad = true) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useFood] Fetching foods with lazy loading:', lazyLoad);
      const data = await getFoodsWithNutrition(undefined, lazyLoad);
      console.log('[useFood] Data received from getFoodsWithNutrition:', data.length, 'foods');
      setFoods(data);
    } catch (err: any) {
      console.error('[useFood] Error fetching foods:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all nutrients - memoized to prevent infinite re-renders
  const fetchNutrients = useCallback(async () => {
    try {
      const data = await getAllNutrients();
      setNutrients(data);
    } catch (err: any) {
      console.error('Failed to fetch nutrients:', err.message);
    }
  }, []);

  // Add new food - memoized
  const addFood = useCallback(async (foodData: CreateFood) => {
    try {
      setLoading(true);
      setError(null);
      const newFood = await createFood(foodData);
      
      // Convert to FoodWithNutrition format
      const foodWithNutrition: FoodWithNutrition = {
        ...newFood,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        nutrients: []
      };
      
      setFoods(prev => [...prev, foodWithNutrition]);
      return newFood;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single food with nutrition - memoized
  const getFood = useCallback(async (id: number): Promise<FoodWithNutrition> => {
    try {
      setLoading(true);
      setError(null);
      return await getFoodWithNutrition(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update food - memoized
  const editFood = useCallback(async (id: number, foodData: CreateFood) => {
    try {
      setLoading(true);
      setError(null);
      const updatedFood = await updateFood(id, foodData);
      
      // Get updated nutrition data
      const foodWithNutrition = await getFoodWithNutrition(id);
      
      setFoods(prev => prev.map(food => 
        food.id === id ? foodWithNutrition : food
      ));
      return updatedFood;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete food - memoized
  const removeFood = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await deleteFood(id);
      setFoods(prev => prev.filter(food => food.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add nutrition data to a food - memoized
  const addFoodNutrient = useCallback(async (foodId: number, nutrientData: CreateFoodNutrient) => {
    try {
      setLoading(true);
      setError(null);
      const newFoodNutrient = await createFoodNutrient(nutrientData);
      
      // Refresh the food with updated nutrition data
      const updatedFood = await getFoodWithNutrition(foodId);
      setFoods(prev => prev.map(food => 
        food.id === foodId ? updatedFood : food
      ));
      
      return newFoodNutrient;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update nutrition data for a food - memoized
  const editFoodNutrient = useCallback(async (foodId: number, nutrientId: number, nutrientData: CreateFoodNutrient) => {
    try {
      setLoading(true);
      setError(null);
      const updatedFoodNutrient = await updateFoodNutrient(nutrientId, nutrientData);
      
      // Refresh the food with updated nutrition data
      const updatedFood = await getFoodWithNutrition(foodId);
      setFoods(prev => prev.map(food => 
        food.id === foodId ? updatedFood : food
      ));
      
      return updatedFoodNutrient;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove nutrition data from a food - memoized
  const removeFoodNutrient = useCallback(async (foodId: number, nutrientId: number) => {
    try {
      setLoading(true);
      setError(null);
      await deleteFoodNutrient(nutrientId);
      
      // Refresh the food with updated nutrition data
      const updatedFood = await getFoodWithNutrition(foodId);
      setFoods(prev => prev.map(food => 
        food.id === foodId ? updatedFood : food
      ));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load full nutrition data for all foods - memoized
  const loadFullNutrition = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useFood] Loading full nutrition data...');
      const data = await getFoodsWithNutrition(undefined, false); // lazyLoad = false
      console.log('[useFood] Full nutrition data loaded for', data.length, 'foods');
      setFoods(data);
    } catch (err: any) {
      console.error('[useFood] Error loading full nutrition:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load foods and nutrients on component mount (with lazy loading for better performance)
  useEffect(() => {
    fetchFoods(true); // Use lazy loading by default
    fetchNutrients();
  }, [fetchFoods, fetchNutrients]);

  return {
    foods,
    nutrients,
    loading,
    error,
    fetchFoods,
    fetchNutrients,
    loadFullNutrition,
    addFood,
    getFood,
    editFood,
    removeFood,
    addFoodNutrient,
    editFoodNutrient,
    removeFoodNutrient
  };
};