require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Note: Using direct mongoose operations instead of models due to collection names
async function seedTestData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // 1. Find or Create Test User
    const usersCollection = db.collection('users');
    let test = await usersCollection.findOne({ email: 'test@fitnova.com' });

    if (!test) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const result = await usersCollection.insertOne({
        name: 'test',
        email: 'test@fitnova.com',
        password: hashedPassword,
        age: 28,
        gender: 'male',
        height: 175,
        weight: 75,
        goal: 'loss',
        activityLevel: 1.55,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      test = await usersCollection.findOne({ _id: result.insertedId });
      console.log('✅ Created user: Test');
    } else {
      console.log('✅ Found existing user: Test');
    }

    const testId = test._id;

    // Get foods and exercises
    const foods = await db.collection('foods').find().limit(30).toArray();
    const exercises = await db.collection('exercises').find().limit(20).toArray();
    console.log(`Found ${foods.length} foods and ${exercises.length} exercises`);

    // 2. Create Tracker Data (Past 30 days)
    console.log('\n📈 Creating tracker data...');
    const trackerLogs = [];
    const today = new Date();
    let currentWeight = 78;

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      if (i > 0) {
        currentWeight -= (0.05 + Math.random() * 0.1);
        currentWeight += (Math.random() - 0.5) * 0.3;
      }

      trackerLogs.push({
        user: testId,
        date: date.toISOString().split('T')[0],
        weight: Math.round(currentWeight * 10) / 10,
        caloriesConsumed: Math.floor(1800 + Math.random() * 400),
        caloriesBurned: Math.floor(2200 + Math.random() * 300),
        waterIntake: Math.round((1.5 + Math.random() * 1.5) * 10) / 10,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await db.collection('trackers').deleteMany({ user: testId });
    await db.collection('trackers').insertMany(trackerLogs);
    console.log(`✅ Created ${trackerLogs.length} tracker entries`);

    // 3. Create Workout Logs
    console.log('\n💪 Creating workout logs...');
    const workoutLogs = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < 30; i++) {
      if (i % 3 === 0 && i > 0) continue;

      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = dayNames[date.getDay()];

      const bodyParts = ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio'];
      const selectedBodyPart = bodyParts[i % bodyParts.length];

      const metValues = {
        chest: 6.0,
        back: 6.0,
        legs: 6.5,
        shoulders: 5.5,
        arms: 5.0,
        abs: 4.5,
        cardio: 8.0
      };

      const userWeight = 70;
      const workoutExercises = [];
      const exercisesByPart = exercises.filter(e => e.bodyPart === selectedBodyPart);

      const numExercises = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < Math.min(numExercises, exercisesByPart.length); j++) {
        const ex = exercisesByPart[j];
        const sets = 3 + Math.floor(Math.random() * 2);
        const reps = selectedBodyPart === 'cardio' ? 0 : (8 + Math.floor(Math.random() * 5));

        const timePerSetInHours = 2 / 60;
        const totalTimeInHours = sets * timePerSetInHours;
        const exerciseTime = selectedBodyPart === 'cardio'
          ? (20 + Math.random() * 10) / 60
          : totalTimeInHours;

        const caloriesBurned = Math.round(
          metValues[selectedBodyPart] * userWeight * exerciseTime
        );

        workoutExercises.push({
          name: ex.name,
          sets,
          reps,
          caloriesBurned
        });
      }

      if (workoutExercises.length) {
        workoutLogs.push({
          user: testId,
          date: date.toISOString().split('T')[0],
          day: dayName,
          name: `${selectedBodyPart.toUpperCase()} Day`,
          exercises: workoutExercises,
          duration: Math.floor(45 + Math.random() * 30),
          totalCaloriesBurned: workoutExercises.reduce((s, e) => s + e.caloriesBurned, 0),
          isRestDay: false,
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    await db.collection('workouts').deleteMany({ user: testId });
    await db.collection('workouts').insertMany(workoutLogs);
    console.log(`✅ Created ${workoutLogs.length} workout logs`);

    // 4. Create Meal Logs
    console.log('\n🍽️ Creating meal logs...');
    const mealLogs = [];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      for (let m = 0; m < 3 + Math.floor(Math.random() * 2); m++) {
        const foodsUsed = [];
        const foodCount = 1 + Math.floor(Math.random() * 3);

        for (let f = 0; f < foodCount; f++) {
          const food = foods[Math.floor(Math.random() * foods.length)];
          const qty = 1 + Math.floor(Math.random() * 2);
          foodsUsed.push({
            id: food._id.toString(),
            name: food.name,
            calories: food.calories * qty,
            protein: food.protein * qty,
            carbs: food.carbs * qty,
            fat: food.fat * qty,
            quantity: qty,
            unit: food.servingUnit
          });
        }

        mealLogs.push({
          user: testId,
          date: dateStr,
          mealType: mealTypes[m % mealTypes.length],
          foods: foodsUsed,
          totalCalories: Math.round(foodsUsed.reduce((s, f) => s + f.calories, 0)),
          totalProtein: Math.round(foodsUsed.reduce((s, f) => s + f.protein, 0) * 10) / 10,
          totalCarbs: Math.round(foodsUsed.reduce((s, f) => s + f.carbs, 0) * 10) / 10,
          totalFat: Math.round(foodsUsed.reduce((s, f) => s + f.fat, 0) * 10) / 10,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    await db.collection('diets').deleteMany({ user: testId });
    await db.collection('diets').insertMany(mealLogs);
    console.log(`✅ Created ${mealLogs.length} meal logs`);

    console.log('\n✨ Test data created successfully!');
    console.log('📝 Login: test@fitnova.com / password123');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedTestData();
}

module.exports = seedTestData;
