const Meal = require('../models/Diet');
const Tracker = require('../models/Tracker');
const Food = require('../models/Food');
const { getTodayDate, calculateTotalCalories, calculateTotalProtein, calculateTotalCarbs, calculateTotalFat } = require('../utils/calorie.util');
const { validationResult } = require('express-validator');

const getTodayMeals = async (req, res) => {
  try {
    const today = getTodayDate();
    const meals = await Meal.find({ user: req.user._id, date: today }).sort({ createdAt: 1 });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logMeal = async (req, res) => {
  try {
    console.log('=== Log Meal Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const today = getTodayDate();
    const { mealType, foods } = req.body;

    console.log('Meal type:', mealType);
    console.log('Number of foods:', foods?.length);
    console.log('Foods array:', JSON.stringify(foods, null, 2));

    //  Validate each food item has required numeric fields
    if (!foods || !Array.isArray(foods) || foods.length === 0) {
      console.error('Invalid foods array');
      return res.status(400).json({ message: 'Foods must be a non-empty array' });
    }

    // Check each food item for required fields and valid numbers
    for (let i = 0; i < foods.length; i++) {
      const food = foods[i];
      console.log(`Validating food ${i}:`, food);
      
      if (!food.name) {
        console.error(`Food ${i} missing name`);
        return res.status(400).json({ message: `Food item ${i} is missing name` });
      }
      
      const requiredNumericFields = ['calories', 'protein', 'carbs', 'fat', 'quantity'];
      for (const field of requiredNumericFields) {
        if (food[field] === undefined || food[field] === null || isNaN(food[field])) {
          console.error(`Food ${i} (${food.name}) has invalid ${field}:`, food[field]);
          return res.status(400).json({ message: `Food item ${i} (${food.name}) has invalid ${field}` });
        }
      }
    }

    const totalCalories = calculateTotalCalories(foods);
    const totalProtein = calculateTotalProtein(foods);
    const totalCarbs = calculateTotalCarbs(foods);
    const totalFat = calculateTotalFat(foods);

    console.log('Calculated totals:', { totalCalories, totalProtein, totalCarbs, totalFat });
    
    const mealData = {
      user: req.user._id,
      date: today,
      mealType,
      foods,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    };
    
    console.log('Creating meal with data:', JSON.stringify(mealData, null, 2));
    
    const meal = await Meal.create(mealData);
    console.log('Meal created successfully:', meal._id);

    let tracker = await Tracker.findOne({ user: req.user._id, date: today });

    if (!tracker) {
      const User = require('../models/User');
      const user = await User.findById(req.user._id);
      tracker = await Tracker.create({
        user: req.user._id,
        date: today,
        caloriesConsumed: totalCalories,
        caloriesBurned: 0,
        waterIntake: 0,
        weight: user.weight
      });
    } else {
      tracker.caloriesConsumed += totalCalories;
      await tracker.save();
    }

    res.status(201).json(meal);
  } catch (error) {
    console.error('=== Error in logMeal ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    // Log Mongoose validation errors in detail
    if (error.name === 'ValidationError') {
      console.error('Mongoose Validation Error Details:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  Field: ${key}`);
        console.error(`  Message: ${error.errors[key].message}`);
        console.error(`  Value: ${error.errors[key].value}`);
      });
    }
    
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    res.status(500).json({ message: error.message, error: error.name });
  }
};

const updateMeal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    if (meal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const oldCalories = meal.totalCalories;
    const { mealType, foods, completedFoodIndices } = req.body;

    meal.mealType = mealType || meal.mealType;
    meal.foods = foods || meal.foods;
    
    // Update completedFoodIndices if provided
    if (completedFoodIndices !== undefined) {
      meal.completedFoodIndices = completedFoodIndices;
    }
    
    meal.totalCalories = calculateTotalCalories(meal.foods);
    meal.totalProtein = calculateTotalProtein(meal.foods);
    meal.totalCarbs = calculateTotalCarbs(meal.foods);
    meal.totalFat = calculateTotalFat(meal.foods);
    const updatedMeal = await meal.save();

    const tracker = await Tracker.findOne({ user: req.user._id, date: meal.date });
    if (tracker) {
      tracker.caloriesConsumed = tracker.caloriesConsumed - oldCalories + meal.totalCalories;
      await tracker.save();
    }

    res.json(updatedMeal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteMeal = async (req, res) => {
  try {
    console.log('Deleting meal with ID:', req.params.id);
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      console.error('Meal not found:', req.params.id);
      return res.status(404).json({ message: 'Meal not found' });
    }

    console.log('Meal user:', meal.user.toString(), 'Request user:', req.user._id.toString());
    if (meal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const tracker = await Tracker.findOne({ user: req.user._id, date: meal.date });
    if (tracker) {
      // Use Math.max to ensure caloriesConsumed never goes below 0
      tracker.caloriesConsumed = Math.max(0, tracker.caloriesConsumed - meal.totalCalories);
      console.log(`Updated tracker calories: ${tracker.caloriesConsumed}`);
      await tracker.save();
    }

    await meal.deleteOne();
    console.log('Meal deleted successfully:', req.params.id);
    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Error in deleteMeal:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Meal ID:', req.params.id);
    res.status(500).json({ message: error.message });
  }
};
const getMealHistory = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const meals = await Meal.find({
      user: req.user._id,
      date: {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0]
      }
    }).sort({ date: 1, createdAt: 1 });

    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const searchFood = async (req, res) => {
  try {
    const { q, category } = req.query;
    let query = {};

    if (q) {
      query.$text = { $search: q };
    }

    if (category) {
      query.category = category;
    }

    const foods = await Food.find(query).limit(20);
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find({}).limit(100);
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const seedFoods = async (req, res) => {
  try {
    const count = await Food.countDocuments();
    if (count > 0) {
      return res.json({ message: 'Foods already seeded' });
    }

    const foods = [
      // Veg
      { name: 'Oatmeal', category: 'veg', calories: 150, protein: 5, carbs: 27, fat: 3, servingSize: 100, servingUnit: 'g' },
      { name: 'Banana', category: 'veg', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, servingSize: 1, servingUnit: 'medium' },
      { name: 'Rice (White)', category: 'veg', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: 100, servingUnit: 'g' },
      { name: 'Lentils (Dal)', category: 'veg', calories: 116, protein: 9, carbs: 20, fat: 0.4, servingSize: 100, servingUnit: 'g' },
      { name: 'Paneer', category: 'veg', calories: 265, protein: 18, carbs: 1.2, fat: 20, servingSize: 100, servingUnit: 'g' },
      { name: 'Greek Yogurt', category: 'veg', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, servingSize: 100, servingUnit: 'g' },
      { name: 'Almonds', category: 'veg', calories: 579, protein: 21, carbs: 22, fat: 50, servingSize: 100, servingUnit: 'g' },
      { name: 'Apple', category: 'veg', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, servingSize: 1, servingUnit: 'medium' },
      { name: 'Broccoli', category: 'veg', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, servingSize: 100, servingUnit: 'g' },
      { name: 'Whole Wheat Bread', category: 'veg', calories: 247, protein: 13, carbs: 41, fat: 3.4, servingSize: 100, servingUnit: 'g' },

      // Non-Veg
      { name: 'Chicken Breast', category: 'non-veg', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: 100, servingUnit: 'g' },
      { name: 'Eggs (Boiled)', category: 'non-veg', calories: 155, protein: 13, carbs: 1.1, fat: 11, servingSize: 100, servingUnit: 'g' },
      { name: 'Salmon', category: 'non-veg', calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: 100, servingUnit: 'g' },
      { name: 'Tuna (Canned)', category: 'non-veg', calories: 132, protein: 28, carbs: 0, fat: 1, servingSize: 100, servingUnit: 'g' }
    ];

    await Food.insertMany(foods);
    res.json({ message: 'Foods seeded successfully', count: foods.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (food) {
      res.json(food);
    } else {
      res.status(404).json({ message: 'Food not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleMealCompletion = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    if (meal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    meal.completed = !meal.completed;
    meal.completedAt = meal.completed ? new Date() : null;
    
    // Auto-complete all food items when meal is marked complete
    if (meal.completed) {
      // Mark all food items as complete
      meal.completedFoodIndices = meal.foods.map((_, index) => index);
    } else {
      // Clear all food item completions when meal is unmarked
      meal.completedFoodIndices = [];
    }
    
    await meal.save();

    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleFoodItemCompletion = async (req, res) => {
  try {
    const { foodIndex } = req.body;
    const meal = await Meal.findById(req.params.id);
    
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    if (meal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Initialize if not exists
    if (!meal.completedFoodIndices) {
      meal.completedFoodIndices = [];
    }

    // Toggle the food index
    const index = meal.completedFoodIndices.indexOf(foodIndex);
    if (index > -1) {
      meal.completedFoodIndices.splice(index, 1);
    } else {
      meal.completedFoodIndices.push(foodIndex);
    }

    await meal.save();
    res.json(meal);
  } catch (error) {
    console.error('Error toggling food item completion:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTodayMeals,
  logMeal,
  updateMeal,
  deleteMeal,
  getMealHistory,
  searchFood,
  getAllFoods,
  getFoodById,
  seedFoods,
  toggleMealCompletion,
  toggleFoodItemCompletion
};
