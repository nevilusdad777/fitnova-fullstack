const calculateBMR = (weight, height, age, gender, formula = 'mifflin', bodyFat = null) => {
  // 1. Katch-McArdle Formula (Requires Body Fat %)
  if (formula === 'katch' && bodyFat !== null) {
    return 370 + 21.6 * (1 - (bodyFat / 100)) * weight;
  }

  // 2. Revised Harris-Benedict Equation
  if (formula === 'harris') {
    if (gender === 'male') {
      return 13.397 * weight + 4.799 * height - 5.677 * age + 88.362;
    } else {
      return 9.247 * weight + 3.098 * height - 4.330 * age + 447.593;
    }
  }

  // 3. Mifflin-St Jeor Equation (Default)
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