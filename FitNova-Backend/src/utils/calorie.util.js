const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const calculateTotalCalories = (foods) => {
  return foods.reduce((total, food) => {
    return total + (food.calories * food.quantity);
  }, 0);
};

const calculateTotalProtein = (foods) => {
  return foods.reduce((total, food) => {
    return total + (food.protein * food.quantity);
  }, 0);
};

const calculateTotalCarbs = (foods) => {
  return foods.reduce((total, food) => {
    return total + (food.carbs * food.quantity);
  }, 0);
};

const calculateTotalFat = (foods) => {
  return foods.reduce((total, food) => {
    return total + (food.fat * food.quantity);
  }, 0);
};

module.exports = {
  getTodayDate,
  calculateTotalCalories,
  calculateTotalProtein,
  calculateTotalCarbs,
  calculateTotalFat
};