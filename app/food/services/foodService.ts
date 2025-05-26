import axios from 'axios';

// Define the base URL for the API
const BASE_URL = 'http://localhost:8080/api/v1';

// Define the Food interface
export interface Food {
  id?: number;
  name: string;
  serving_size_gram: number;
  source: string;
}

// Create a new food
export const createFood = async (food: Omit<Food, 'id'>): Promise<Food> => {
  try {
    const response = await axios.post(`${BASE_URL}/foods`, food);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error('Invalid food data provided');
    }
    throw new Error('Failed to create food');
  }
};

// Get all foods
export const getAllFoods = async (): Promise<Food[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/foods`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to retrieve foods');
  }
};

// Get food by ID
export const getFoodById = async (id: number): Promise<Food> => {
  try {
    const response = await axios.get(`${BASE_URL}/foods/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Food not found');
    }
    throw new Error('Failed to retrieve food');
  }
};

// Update a food
export const updateFood = async (id: number, food: Omit<Food, 'id'>): Promise<Food> => {
  try {
    const response = await axios.put(`${BASE_URL}/foods/${id}`, food);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Food not found');
    }
    throw new Error('Failed to update food');
  }
};

// Delete a food
export const deleteFood = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(`${BASE_URL}/foods/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Food not found');
    }
    throw new Error('Failed to delete food');
  }
}; 