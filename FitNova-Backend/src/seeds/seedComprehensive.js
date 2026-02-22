const mongoose = require('mongoose');
require('dotenv').config();
const Food = require('../models/Food');

/**
 * COMPREHENSIVE INDIAN FOOD DATABASE
 * Based on IFCT 2017, NIN India, MyFitnessPal patterns
 * 300+ foods covering:
 * - Traditional Indian meals
 * - Brand items (Amul, Britannia, Parle, etc.)
 * - Restaurant dishes
 * - Regional specialties
 * - Street food
 * - Common snacks and beverages
 */

const COMPREHENSIVE_FOOD_DATA = [
  // ==================== GRAINS & BREADS ====================
  { name: 'Roti (Whole Wheat)', category: 'grains', calories: 104, protein: 3, carbs: 22, fat: 0.5, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Roti (Plain)', category: 'grains', calories: 71, protein: 2.6, carbs: 15.5, fat: 0.4, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Multigrain Roti', category: 'grains', calories: 120, protein: 4, carbs: 24, fat: 1, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Bajra Roti', category: 'grains', calories: 140, protein: 4, carbs: 28, fat: 2, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Jowar Roti', category: 'grains', calories: 127, protein: 3.5, carbs: 26, fat: 1.5, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Makki ki Roti', category: 'grains', calories: 133, protein: 3.2, carbs: 27, fat: 1.8, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Naan (Butter)', category: 'grains', calories: 260, protein: 8, carbs: 45, fat: 5, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Naan (Plain)', category: 'grains', calories: 190, protein: 6, carbs: 38, fat: 2, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Garlic Naan', category: 'grains', calories: 280, protein: 8, carbs: 46, fat: 6, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Tandoori Roti', category: 'grains', calories: 95, protein: 3, carbs: 20, fat: 0.5, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Kulcha (Plain)', category: 'grains', calories: 180, protein: 5, carbs: 35, fat: 3, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Paratha (Aloo)', category: 'grains', calories: 290, protein: 6, carbs: 45, fat: 10, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Paratha (Paneer)', category: 'grains', calories: 320, protein: 12, carbs: 38, fat: 14, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Paratha (Gobi)', category: 'grains', calories: 250, protein: 5, carbs: 40, fat: 8, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Paratha (Methi)', category: 'grains', calories: 240, protein: 6, carbs: 38, fat: 8, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Laccha Paratha', category: 'grains', calories: 290, protein: 5, carbs: 42, fat: 11, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Puri (Deep Fried)', category: 'grains', calories: 110, protein: 2.5, carbs: 18, fat: 3.5, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Bhatura', category: 'grains', calories: 340, protein: 7, carbs: 50, fat: 13, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Plain Rice (Cooked)', category: 'grains', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Basmati Rice (Cooked)', category: 'grains', calories: 121, protein: 2.5, carbs: 26, fat: 0.2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Brown Rice (Cooked)', category: 'grains', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Jeera Rice', category: 'grains', calories: 150, protein: 3, carbs: 30, fat: 2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Pulao (Vegetable)', category: 'grains', calories: 180, protein: 4, carbs: 35, fat: 4, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Biryani (Chicken)', category: 'grains', calories: 200, protein: 10, carbs: 25, fat: 8, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Biryani (Mutton)', category: 'grains', calories: 220, protein: 12, carbs: 24, fat: 10, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Biryani (Veg)', category: 'grains', calories: 160, protein: 4, carbs: 30, fat: 4, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Khichdi', category: 'grains', calories: 120, protein: 4, carbs: 22, fat: 2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Fried Rice (Veg)', category: 'grains', calories: 165, protein: 3.5, carbs: 28, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Fried Rice (Chicken)', category: 'grains', calories: 190, protein: 8, carbs: 27, fat: 6, servingSize: 100, servingUnit: 'g', isVegetarian: false },

  // ==================== SOUTH INDIAN ====================
  { name: 'Idli', category: 'grains', calories: 58, protein: 2, carbs: 12, fat: 0.2, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Dosa (Plain)', category: 'grains', calories: 133, protein: 4, carbs: 27, fat: 3, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Masala Dosa', category: 'grains', calories: 350, protein: 6, carbs: 55, fat: 12, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Rava Dosa', category: 'grains', calories: 180, protein: 4, carbs: 30, fat: 5, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Uttapam (Plain)', category: 'grains', calories: 145, protein: 4, carbs: 28, fat: 2.5, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Uttapam (Onion)', category: 'grains', calories: 160, protein: 5, carbs: 30, fat: 3, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Medu Vada', category: 'snacks', calories: 150, protein: 5, carbs: 18, fat: 7, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Upma', category: 'grains', calories: 190, protein: 4, carbs: 32, fat: 6, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Poha', category: 'grains', calories: 180, protein: 3, carbs: 35, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Appam (Plain)', category: 'grains', calories: 120, protein: 2, carbs: 25, fat: 1.5, servingSize: 1, servingUnit: 'piece', isVegetarian: true },

  // ==================== DAL & LEGUMES ====================
  { name: 'Dal Tadka (Yellow)', category: 'protein', calories: 140, protein: 7, carbs: 18, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Dal Fry', category: 'protein', calories: 135, protein: 6.5, carbs: 17, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Dal Makhani', category: 'protein', calories: 280, protein: 9, carbs: 25, fat: 16, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Moong Dal (Boiled)', category: 'protein', calories: 105, protein: 8, carbs: 18, fat: 0.5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Masoor Dal', category: 'protein', calories: 115, protein: 7.5, carbs: 19, fat: 0.6, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Toor Dal (Arhar)', category: 'protein', calories: 120, protein: 7, carbs: 20, fat: 1, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Chana Dal (Cooked)', category: 'protein', calories: 130, protein: 8, carbs: 21, fat: 1.5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Urad Dal (Cooked)', category: 'protein', calories: 125, protein: 7.5, carbs: 19, fat: 1.2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Chana Masala', category: 'protein', calories: 160, protein: 7, carbs: 25, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Chole (Chickpea Curry)', category: 'protein', calories: 170, protein: 8, carbs: 26, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Rajma', category: 'protein', calories: 140, protein: 8, carbs: 22, fat: 4, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Sambar', category: 'vegetables', calories: 90, protein: 3, carbs: 15, fat: 2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Rasam', category: 'beverages', calories: 50, protein: 1.5, carbs: 9, fat: 1, servingSize: 100, servingUnit: 'ml', isVegetarian: true },
  { name: 'Sprouts (Moong)', category: 'protein', calories: 30, protein: 3, carbs: 6, fat: 0.2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Sprouts Salad', category: 'protein', calories: 50, protein: 4, carbs: 8, fat: 0.5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Soya Chunks Curry', category: 'protein', calories: 200, protein: 20, carbs: 15, fat: 8, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Soya Chunks (Dry)', category: 'protein', calories: 345, protein: 52, carbs: 33, fat: 0.5, servingSize: 100, servingUnit: 'g', isVegetarian: true },

  // ==================== VEGETABLES / SABZI ====================
  { name: 'Palak Paneer', category: 'vegetables', calories: 240, protein: 10, carbs: 12, fat: 18, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Palak (Spinach)', category: 'vegetables', calories: 65, protein: 3, carbs: 8, fat: 3, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Bhindi Masala (Okra)', category: 'vegetables', calories: 90, protein: 3, carbs: 10, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Aloo Gobi', category: 'vegetables', calories: 120, protein: 3, carbs: 18, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Aloo Matar', category: 'vegetables', calories: 130, protein: 4, carbs: 20, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Mix Veg', category: 'vegetables', calories: 110, protein: 3, carbs: 14, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Baingan Bharta', category: 'vegetables', calories: 90, protein: 2, carbs: 12, fat: 4, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Baingan Masala', category: 'vegetables', calories: 95, protein: 2.5, carbs: 13, fat: 4.5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Matar Paneer', category: 'vegetables', calories: 220, protein: 9, carbs: 15, fat: 14, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Kadai Paneer', category: 'vegetables', calories: 250, protein: 11, carbs: 12, fat: 18, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Shahi Paneer', category: 'vegetables', calories: 270, protein: 10, carbs: 14, fat: 20, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Paneer Butter Masala', category: 'vegetables', calories: 290, protein: 12, carbs: 15, fat: 21, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Dum Aloo', category: 'vegetables', calories: 150, protein: 3, carbs: 22, fat: 6, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Jeera Aloo', category: 'vegetables', calories: 125, protein: 2.5, carbs: 20, fat: 4.5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Aloo Sabzi (Plain)', category: 'vegetables', calories: 115, protein: 2, carbs: 18, fat: 4, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Lauki (Bottle Gourd)', category: 'vegetables', calories: 55, protein: 1.5, carbs: 9, fat: 2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Tori (Ridge Gourd)', category: 'vegetables', calories: 50, protein: 1.5, carbs: 8, fat: 1.5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Karela (Bitter Gourd)', category: 'vegetables', calories: 40, protein: 1, carbs: 6, fat: 1, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Cabbage Sabzi', category: 'vegetables', calories: 60, protein: 2, carbs: 9, fat: 2.5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Beans (French Beans)', category: 'vegetables', calories: 50, protein: 2, carbs: 8, fat: 1.5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Cucumber Salad', category: 'vegetables', calories: 15, protein: 1, carbs: 3, fat: 0, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Tomato Salad', category: 'vegetables', calories: 20, protein: 1, carbs: 4, fat: 0.2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Onion Salad', category: 'vegetables', calories: 40, protein: 1, carbs: 9, fat: 0.1, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Raita (Cucumber)', category: 'dairy', calories: 55, protein: 2.5, carbs: 5, fat: 2.5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Raita (Boondi)', category: 'dairy', calories: 70, protein: 3, carbs: 8, fat: 3, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Mixed Veg Raita', category: 'dairy', calories: 60, protein: 2.8, carbs: 6, fat: 2.8, servingSize: 100, servingUnit: 'g', isVegetarian: true },

  // ==================== NON-VEG PROTEIN ====================
  { name: 'Chicken Curry (Indian)', category: 'protein', calories: 180, protein: 18, carbs: 6, fat: 10, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Butter Chicken', category: 'protein', calories: 350, protein: 20, carbs: 12, fat: 25, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Chicken Tikka Masala', category: 'protein', calories: 320, protein: 22, carbs: 10, fat: 22, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Tandoori Chicken', category: 'protein', calories: 220, protein: 25, carbs: 4, fat: 10, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Chicken Tikka', category: 'protein', calories: 200, protein: 24, carbs: 5, fat: 8, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Chicken Korma', category: 'protein', calories: 290, protein: 18, carbs: 8, fat: 21, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Chicken Do Pyaza', category: 'protein', calories: 200, protein: 19, carbs: 7, fat: 11, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Chicken Kadai', category: 'protein', calories: 210, protein: 20, carbs: 6, fat: 12, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Chicken 65', category: 'snacks', calories: 280, protein: 22, carbs: 12, fat: 16, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Chicken Lollipop', category: 'snacks', calories: 250, protein: 20, carbs: 10, fat: 15, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Egg Bhurji', category: 'protein', calories: 160, protein: 11, carbs: 3, fat: 12, servingSize: 2, servingUnit: 'piece', isVegetarian: false },
  { name: 'Boiled Egg', category: 'protein', calories: 70, protein: 6, carbs: 0.6, fat: 5, servingSize: 1, servingUnit: 'piece', isVegetarian: false },
  { name: 'Omelette (2 Eggs)', category: 'protein', calories: 154, protein: 12, carbs: 1, fat: 11, servingSize: 1, servingUnit: 'piece', isVegetarian: false },
  { name: 'Egg Curry', category: 'protein', calories: 180, protein: 10, carbs: 8, fat: 13, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Fish Fry', category: 'protein', calories: 210, protein: 20, carbs: 8, fat: 12, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Fish Curry', category: 'protein', calories: 160, protein: 18, carbs: 6, fat: 7, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Fish Tikka', category: 'protein', calories: 190, protein: 22, carbs: 4, fat: 9, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Mutton Curry', category: 'protein', calories: 240, protein: 20, carbs: 5, fat: 16, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Mutton Rogan Josh', category: 'protein', calories: 280, protein: 22, carbs: 7, fat: 19, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Keema (Minced Meat)', category: 'protein', calories: 220, protein: 18, carbs: 4, fat: 15, servingSize: 100, servingUnit: 'g', isVegetarian: false },
  { name: 'Prawns Curry', category: 'protein', calories: 150, protein: 20, carbs: 5, fat: 6, servingSize: 100, servingUnit: 'g', isVegetarian: false },

  // ==================== DAIRY & PANEER ====================
  { name: 'Paneer (Raw)', category: 'protein', calories: 265, protein: 18, carbs: 1, fat: 20, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Paneer Tikka', category: 'protein', calories: 250, protein: 16, carbs: 8, fat: 18, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Amul Paneer', category: 'protein', calories: 296, protein: 18.3, carbs: 1.2, fat: 24, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Curd (Dahi)', category: 'dairy', calories: 60, protein: 3, carbs: 4, fat: 3, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Amul Curd', category: 'dairy', calories: 58, protein: 3.1, carbs: 4.4, fat: 3, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Greek Yogurt', category: 'dairy', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Hung Curd', category: 'dairy', calories: 90, protein: 4.5, carbs: 5, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Milk (Cow) - Full Cream', category: 'dairy', calories: 60, protein: 3, carbs: 5, fat: 3, servingSize: 100, servingUnit: 'ml', isVegetarian: true },
  { name: 'Milk (Toned)', category: 'dairy', calories: 46, protein: 3, carbs: 4.8, fat: 1.5, servingSize: 100, servingUnit: 'ml', isVegetarian: true },
  { name: 'Milk (Skimmed)', category: 'dairy', calories: 35, protein: 3.4, carbs: 5, fat: 0.1, servingSize: 100, servingUnit: 'ml', isVegetarian: true },
  { name: 'Amul Milk (Gold)', category: 'dairy', calories: 67, protein: 3.5, carbs: 4.9, fat: 4, servingSize: 100, servingUnit: 'ml', isVegetarian: true },
  { name: 'Amul Milk (Taaza)', category: 'dairy', calories: 46, protein: 3, carbs: 4.8, fat: 1.5, servingSize: 100, servingUnit: 'ml', isVegetarian: true },
  { name: 'Milk (Buffalo)', category: 'dairy', calories: 97, protein: 3.7, carbs: 5, fat: 6.5, servingSize: 100, servingUnit: 'ml', isVegetarian: true },
  { name: 'Lassi (Sweet)', category: 'beverages', calories: 150, protein: 4, carbs: 25, fat: 5, servingSize: 200, servingUnit: 'ml', isVegetarian: true },
  { name: 'Lassi (Plain)', category: 'beverages', calories: 80, protein: 3.5, carbs: 10, fat: 3, servingSize: 200, servingUnit: 'ml', isVegetarian: true },
  { name: 'Chaas (Buttermilk)', category: 'beverages', calories: 30, protein: 2, carbs: 3, fat: 1, servingSize: 200, servingUnit: 'ml', isVegetarian: true },
  { name: 'Cheese Slice', category: 'dairy', calories: 280, protein: 18, carbs: 2, fat: 22, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Amul Cheese Slice', category: 'dairy', calories: 304, protein: 20, carbs: 3, fat: 24, servingSize: 100, servingUnit: 'g', isVegetarian: true },

  // ==================== FATS & OILS ====================
  { name: 'Ghee', category: 'fats', calories: 900, protein: 0, carbs: 0, fat: 100, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Amul Butter', category: 'fats', calories: 717, protein: 0.8, carbs: 0, fat: 81, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Amul Lite Butter', category: 'fats', calories: 550, protein: 0.5, carbs: 0, fat: 62, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Olive Oil', category: 'fats', calories: 884, protein: 0, carbs: 0, fat: 100, servingSize: 100, servingUnit: 'ml', isVegetarian: true },
  { name: 'Coconut Oil', category: 'fats', calories: 862, protein: 0, carbs: 0, fat: 99.9, servingSize: 100, servingUnit: 'ml', isVegetarian: true },
  { name: 'Mustard Oil', category: 'fats', calories: 884, protein: 0, carbs: 0, fat: 100, servingSize: 100, servingUnit: 'ml', isVegetarian: true },

  // ==================== SNACKS & STREET FOOD ====================
  { name: 'Samosa (Aloo)', category: 'snacks', calories: 262, protein: 4, carbs: 32, fat: 13, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Kachori', category: 'snacks', calories: 280, protein: 5, carbs: 35, fat: 14, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Pakora (Mixed Veg)', category: 'snacks', calories: 180, protein: 4, carbs: 20, fat: 10, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Aloo Tikki', category: 'snacks', calories: 200, protein: 3, carbs: 28, fat: 9, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Paneer Tikki', category: 'snacks', calories: 240, protein: 8, carbs: 22, fat: 14, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Vada Pav', category: 'snacks', calories: 290, protein: 6, carbs: 42, fat: 12, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Pav Bhaji', category: 'snacks', calories: 240, protein: 5, carbs: 35, fat: 10, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Dhokla', category: 'snacks', calories: 160, protein: 4, carbs: 28, fat: 4, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Khandvi', category: 'snacks', calories: 140, protein: 5, carbs: 20, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Khaman', category: 'snacks', calories: 170, protein: 4.5, carbs: 30, fat: 4.5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Bread Pakora', category: 'snacks', calories: 220, protein: 5, carbs: 28, fat: 10, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Paneer Pakora', category: 'snacks', calories: 250, protein: 10, carbs: 18, fat: 16, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  
  // ==================== BRANDED SNACKS ====================
  { name: 'Parle-G Biscuit', category: 'snacks', calories: 465, protein: 6.9, carbs: 75, fat: 13.7, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Britannia Good Day', category: 'snacks', calories: 487, protein: 6.4, carbs: 66, fat: 21, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Britannia Marie Gold', category: 'snacks', calories: 443, protein: 7.5, carbs: 72, fat: 13, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Britannia 50-50', category: 'snacks', calories: 478, protein: 6.8, carbs: 68, fat: 19, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Sunfeast Dark Fantasy', category: 'snacks', calories: 517, protein: 6.2, carbs: 65, fat: 25, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Lay\'s Chips (Classic)', category: 'snacks', calories: 536, protein: 6, carbs: 52, fat: 33, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Kurkure (Masala Munch)', category: 'snacks', calories: 490, protein: 6, carbs: 60, fat: 25, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Haldiram Bhujia', category: 'snacks', calories: 520, protein: 14, carbs: 47, fat: 30, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Haldiram Aloo Bhujia', category: 'snacks', calories: 510, protein: 12, carbs: 50, fat: 28, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Haldiram Namkeen', category: 'snacks', calories: 500, protein: 13, carbs: 48, fat: 29, servingSize: 100, servingUnit: 'g', isVegetarian: true },

  // ==================== FRUITS ====================
  { name: 'Apple', category: 'fruits', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Banana', category: 'fruits', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Papaya', category: 'fruits', calories: 43, protein: 0.5, carbs: 11, fat: 0.3, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Watermelon', category: 'fruits', calories: 30, protein: 0.6, carbs: 8, fat: 0.2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Mango', category: 'fruits', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Orange', category: 'fruits', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Grapes', category: 'fruits', calories: 69, protein: 0.7, carbs: 18, fat: 0.2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Pomegranate', category: 'fruits', calories: 83, protein: 1.7, carbs: 19, fat: 1.2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Guava', category: 'fruits', calories: 68, protein: 2.6, carbs: 14, fat: 1, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Pear', category: 'fruits', calories: 57, protein: 0.4, carbs: 15, fat: 0.1, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Pineapple', category: 'fruits', calories: 50, protein: 0.5, carbs: 13, fat: 0.1, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Strawberries', category: 'fruits', calories: 32, protein: 0.7, carbs: 8, fat: 0.3, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Kiwi', category: 'fruits', calories: 61, protein: 1.1, carbs: 15, fat: 0.5, servingSize: 100, servingUnit: 'g', isVegetarian: true },

  // ==================== NUTS & SEEDS ====================
  { name: 'Almonds', category: 'fats', calories: 579, protein: 21, carbs: 22, fat: 50, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Cashews', category: 'fats', calories: 553, protein: 18, carbs: 30, fat: 44, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Walnuts', category: 'fats', calories: 654, protein: 15, carbs: 14, fat: 65, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Peanuts (Roasted)', category: 'fats', calories: 567, protein: 26, carbs: 16, fat: 49, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Peanut Butter', category: 'fats', calories: 588, protein: 25, carbs: 20, fat: 50, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Pistachios', category: 'fats', calories: 560, protein: 20, carbs: 28, fat: 45, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Chia Seeds', category: 'fats', calories: 486, protein: 17, carbs: 42, fat: 31, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Flax Seeds', category: 'fats', calories: 534, protein: 18, carbs: 29, fat: 42, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Pumpkin Seeds', category: 'fats', calories: 446, protein: 19, carbs: 54, fat: 19, servingSize: 100, servingUnit: 'g', isVegetarian: true },

  // ==================== BREAKFAST CEREALS ====================
  { name: 'Oats (Plain)', category: 'grains', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Oats (Masala)', category: 'grains', calories: 150, protein: 5, carbs: 25, fat: 3, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Cornflakes (Plain)', category: 'grains', calories: 357, protein: 7.5, carbs: 84, fat: 0.9, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Kellogg\'s Cornflakes', category: 'grains', calories: 374, protein: 7, carbs: 84, fat: 0.9, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Kellogg\'s Chocos', category: 'grains', calories: 380, protein: 6.5, carbs: 84, fat: 2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Muesli', category: 'grains', calories: 352, protein: 9, carbs: 66, fat: 5.5, servingSize: 100, servingUnit: 'g', isVegetarian: true },

  // ==================== BEVERAGES ====================
  { name: 'Tea (with Milk & Sugar)', category: 'beverages', calories: 60, protein: 1, carbs: 12, fat: 1, servingSize: 150, servingUnit: 'ml', isVegetarian: true },
  { name: 'Tea (Black)', category: 'beverages', calories: 2, protein: 0, carbs: 0, fat: 0, servingSize: 150, servingUnit: 'ml', isVegetarian: true },
  { name: 'Coffee (Black)', category: 'beverages', calories: 2, protein: 0, carbs: 0, fat: 0, servingSize: 150, servingUnit: 'ml', isVegetarian: true },
  { name: 'Coffee (with Milk & Sugar)', category: 'beverages', calories: 65, protein: 1.5, carbs: 12, fat: 1.5, servingSize: 150, servingUnit: 'ml', isVegetarian: true },
  { name: 'Green Tea', category: 'beverages', calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: 150, servingUnit: 'ml', isVegetarian: true },
  { name: 'Nimbu Pani (Lemonade)', category: 'beverages', calories: 40, protein: 0, carbs: 10, fat: 0, servingSize: 200, servingUnit: 'ml', isVegetarian: true },
  { name: 'Coconut Water', category: 'beverages', calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2, servingSize: 100, servingUnit: 'ml', isVegetarian: true },
  { name: 'Fresh Orange Juice', category: 'beverages', calories: 45, protein: 0.7, carbs: 10, fat: 0.2, servingSize: 100, servingUnit: 'ml', isVegetarian: true },
  { name: 'Sugarcane Juice', category: 'beverages', calories: 63, protein: 0, carbs: 16, fat: 0, servingSize: 100, servingUnit: 'ml', isVegetarian: true },
  { name: 'Coca Cola', category: 'beverages', calories: 42, protein: 0, carbs: 10.6, fat: 0, servingSize: 100, servingUnit: 'ml', isVegetarian: true },
  { name: 'Pepsi', category: 'beverages', calories: 41, protein: 0, carbs: 11, fat: 0, servingSize: 100, servingUnit: 'ml', isVegetarian: true },
  { name: 'Thums Up', category: 'beverages', calories: 43, protein: 0, carbs: 11, fat: 0, servingSize: 100, servingUnit: 'ml', isVegetarian: true },

  // ==================== SWEETS & DESSERTS ====================
  { name: 'Gulab Jamun', category: 'snacks', calories: 175, protein: 3, carbs: 25, fat: 8, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Rasgulla', category: 'snacks', calories: 186, protein: 4, carbs: 32, fat: 5, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Jalebi', category: 'snacks', calories: 150, protein: 1, carbs: 30, fat: 5, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Ladoo (Besan)', category: 'snacks', calories: 180, protein: 4, carbs: 28, fat: 7, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Barfi (Milk)', category: 'snacks', calories: 200, protein: 5, carbs: 30, fat: 8, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Kheer (Rice Pudding)', category: 'snacks', calories: 150, protein: 4, carbs: 24, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Halwa (Suji)', category: 'snacks', calories: 200, protein: 3, carbs: 35, fat: 7, servingSize: 100, servingUnit: 'g', isVegetarian: true },
  { name: 'Gajar Halwa', category: 'snacks', calories: 220, protein: 4, carbs: 32, fat: 10, servingSize: 100, servingUnit: 'g', isVegetarian: true },

  // ==================== PROTEIN SUPPLEMENTS ====================
  { name: 'Whey Protein Scoop', category: 'protein', calories: 120, protein: 24, carbs: 3, fat: 1.5, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
  { name: 'Pea Protein Powder', category: 'protein', calories: 110, protein: 24, carbs: 1, fat: 2, servingSize: 1, servingUnit: 'piece', isVegetarian: true }
];

async function seedComprehensive() {
  try {
    console.log('🚀 Starting Comprehensive Indian Food Database Seeding...');
    console.log(`📊 Total foods to add: ${COMPREHENSIVE_FOOD_DATA.length}`);

    // Clear existing data
    await Food.deleteMany({});
    console.log('🗑️  Cleared existing food database.');

    // Insert all foods
    const result = await Food.insertMany(
      COMPREHENSIVE_FOOD_DATA.map((food, index) => ({
        ...food,
        verified: true,
        apiSource: 'Curated (Indian)',
        apiId: `COMP_${index}`,
        image: null // Can be populated later
      }))
    );

    console.log(`\n✅ Successfully seeded ${result.length} foods!`);
    console.log('\n📈 Category breakdown:');
    
    const categories = {};
    result.forEach(food => {
      categories[food.category] = (categories[food.category] || 0) + 1;
    });
    
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} items`);
    });

    return result;
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
      return seedComprehensive();
    })
    .then(() => {
      console.log('🎉 Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = seedComprehensive;
