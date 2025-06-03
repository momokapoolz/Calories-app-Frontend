import { useState } from 'react';
import { FoodWithNutrition, Nutrient, CreateFoodNutrient, FoodNutrient } from '../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

interface NutritionFormProps {
  food: FoodWithNutrition;
  nutrients: Nutrient[];
  onAddNutrient: (foodId: number, nutrientData: CreateFoodNutrient) => Promise<any>;
  onUpdateNutrient: (foodId: number, nutrientId: number, nutrientData: CreateFoodNutrient) => Promise<any>;
  onRemoveNutrient: (foodId: number, nutrientId: number) => Promise<void>;
}

export function NutritionForm({ 
  food, 
  nutrients, 
  onAddNutrient, 
  onUpdateNutrient, 
  onRemoveNutrient 
}: NutritionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNutrientId, setSelectedNutrientId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [editingNutrient, setEditingNutrient] = useState<FoodNutrient | null>(null);

  // Get nutrients that aren't already added to this food
  const availableNutrients = nutrients.filter(nutrient => 
    !food.nutrients?.some(fn => fn.nutrient_id === nutrient.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedNutrientId || !amount || !food.id) return;

    const nutrientData: CreateFoodNutrient = {
      food_id: food.id,
      nutrient_id: parseInt(selectedNutrientId),
      amount_per_100g: parseFloat(amount)
    };

    try {
      if (editingNutrient) {
        await onUpdateNutrient(food.id, editingNutrient.id!, nutrientData);
      } else {
        await onAddNutrient(food.id, nutrientData);
      }
      
      // Reset form
      setSelectedNutrientId('');
      setAmount('');
      setEditingNutrient(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to manage nutrient:', error);
    }
  };

  const handleEdit = (foodNutrient: FoodNutrient) => {
    setEditingNutrient(foodNutrient);
    setSelectedNutrientId(foodNutrient.nutrient_id.toString());
    setAmount(foodNutrient.amount_per_100g.toString());
    setIsOpen(true);
  };

  const handleRemove = async (foodNutrient: FoodNutrient) => {
    if (!food.id || !foodNutrient.id) return;
    
    try {
      await onRemoveNutrient(food.id, foodNutrient.id);
    } catch (error) {
      console.error('Failed to remove nutrient:', error);
    }
  };

  const resetForm = () => {
    setSelectedNutrientId('');
    setAmount('');
    setEditingNutrient(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Nutrition Information</h3>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Nutrient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingNutrient ? 'Edit Nutrient' : 'Add Nutrient'} - {food.name}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nutrient">Nutrient</Label>
                <Select 
                  value={selectedNutrientId} 
                  onValueChange={setSelectedNutrientId}
                  disabled={!!editingNutrient}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a nutrient" />
                  </SelectTrigger>
                  <SelectContent>
                    {(editingNutrient ? nutrients : availableNutrients).map((nutrient) => (
                      <SelectItem key={nutrient.id} value={nutrient.id.toString()}>
                        {nutrient.name} ({nutrient.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount per 100g</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount per 100g"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingNutrient ? 'Update' : 'Add'} Nutrient
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Display current nutrients */}
      <div className="space-y-2">
        {food.nutrients && food.nutrients.length > 0 ? (
          food.nutrients.map((foodNutrient) => (
            <div key={foodNutrient.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <Badge variant="secondary">
                  {foodNutrient.nutrient?.category || 'Unknown'}
                </Badge>
                <div>
                  <span className="font-medium">
                    {foodNutrient.nutrient?.name || 'Unknown Nutrient'}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {foodNutrient.amount_per_100g}g per 100g
                  </span>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(foodNutrient)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(foodNutrient)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No nutrition information added yet. Click "Add Nutrient" to get started.
          </p>
        )}
      </div>

      {/* Display calculated nutrition summary */}
      {food.nutrients && food.nutrients.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded">
          <div className="text-center">
            <div className="text-lg font-semibold">{food.calories || 0}</div>
            <div className="text-sm text-muted-foreground">Calories</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{food.protein || 0}g</div>
            <div className="text-sm text-muted-foreground">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{food.carbs || 0}g</div>
            <div className="text-sm text-muted-foreground">Carbs</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{food.fat || 0}g</div>
            <div className="text-sm text-muted-foreground">Fat</div>
          </div>
        </div>
      )}
    </div>
  );
}
