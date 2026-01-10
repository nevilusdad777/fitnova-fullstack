const calculateBMR = (weight, height, age, gender) => {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

const calculateTDEE = (bmr, activityLevel) => {
  return bmr * activityLevel;
};

const calculateDailyCalorieTarget = (tdee, goal) => {
  if (goal === 'loss') {
    return tdee - 500;
  } else if (goal === 'gain') {
    return tdee + 500;
  }
  return tdee;
};

module.exports = {
  calculateBMR,
  calculateTDEE,
  calculateDailyCalorieTarget
};