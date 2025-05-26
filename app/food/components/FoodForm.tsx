import { useState, ReactNode } from 'react';
import { Food } from '../services/foodService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface FoodFormProps {
  food?: Food;
  onSubmit: (foodData: Omit<Food, 'id'>) => Promise<Food>;
  buttonText?: ReactNode;
}

export function FoodForm({ food, onSubmit, buttonText = "Add Custom Food" }: FoodFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Food, 'id'>>({
    name: food?.name || '',
    serving_size_gram: food?.serving_size_gram || 100,
    source: food?.source || 'USER'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setIsOpen(false);
      setFormData({ name: '', serving_size_gram: 100, source: 'USER' });
    } catch (error) {
      console.error('Failed to submit food:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          {typeof buttonText === 'string' ? (
            <>
              <Plus className="mr-2 h-4 w-4" />
              {buttonText}
            </>
          ) : (
            buttonText
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{food ? 'Edit Food' : 'Add New Food'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Food Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter food name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serving_size">Serving Size (grams)</Label>
            <Input
              id="serving_size"
              type="number"
              value={formData.serving_size_gram}
              onChange={(e) => setFormData(prev => ({ ...prev, serving_size_gram: Number(e.target.value) }))}
              placeholder="Enter serving size in grams"
              required
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
              placeholder="Enter food source"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {food ? 'Update' : 'Add'} Food
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 