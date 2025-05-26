import { useState, useEffect } from 'react';
import { Food, createFood, getAllFoods, getFoodById, updateFood, deleteFood } from '../services/foodService';

export const useFood = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all foods
  const fetchFoods = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllFoods();
      setFoods(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new food
  const addFood = async (foodData: Omit<Food, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newFood = await createFood(foodData);
      setFoods(prev => [...prev, newFood]);
      return newFood;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get single food
  const getFood = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      return await getFoodById(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update food
  const editFood = async (id: number, foodData: Omit<Food, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedFood = await updateFood(id, foodData);
      setFoods(prev => prev.map(food => food.id === id ? updatedFood : food));
      return updatedFood;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete food
  const removeFood = async (id: number) => {
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
  };

  // Load foods on component mount
  useEffect(() => {
    fetchFoods();
  }, []);

  return {
    foods,
    loading,
    error,
    fetchFoods,
    addFood,
    getFood,
    editFood,
    removeFood
  };
}; 