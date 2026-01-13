require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Note: Using direct mongoose operations instead of models due to collection names
async function seedKrishData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // 1. Find or Create Krish User
    const usersCollection = db.collection('users');
    let krish = await usersCollection.findOne({ email: 'krish@fitnova.com' });
    
    if (!krish) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const result = await usersCollection.insertOne({
        name: 'Krish',
        email: 'krish@fitnova.com',
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
      krish = await usersCollection.findOne({ _id: result.insertedId });
      console.log('✅ Created user: Krish');
    } else {
      console.log('✅ Found existing user: Krish');
    }

    const krishId = krish._id;

    // Get foods and exercises
    const foods = await db.collection('foods').find().limit(30).toArray();
    const exercises = await db.collection('exercises').find().limit(20).toArray();
    console.log(`Found ${foods.length} foods and ${exercises.length} exercises`);

    // 2. Create Tracker Data (Past 30 days)
    console.log('\n� Creating tracker data...');
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

      const tracker = {
        user: krishId,
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        weight: Math.round(currentWeight * 10) / 10,
        caloriesConsumed: Math.floor(1800 + Math.random() * 400),
        caloriesBurned: Math.floor(2200 + Math.random() * 300),
        waterIntake: Math.round((1.5 + Math.random() * 1.5) * 10) / 10, // 1.5-3L realistic range
        createdAt: new Date(),
        updatedAt: new Date()
      };

      trackerLogs.push(tracker);
    }

    await db.collection('trackers').deleteMany({ user: krishId });
    await db.collection('trackers').insertMany(trackerLogs);
    console.log(`✅ Created ${trackerLogs.length} tracker entries`);

    // 3. Create Workout Logs (Past 30 days)  
    console.log('\n💪 Creating workout logs...');
    const workoutLogs = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < 30; i++) {
      // Skip some days (rest days)
      if (i % 3 === 0 && i > 0) continue; // Rest every 3rd day roughly

      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = dayNames[date.getDay()];

      const bodyParts = ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio'];
      const selectedBodyPart = bodyParts[i % bodyParts.length];

      // MET values for different exercise types (based on research)
      const metValues = {
        chest: 6.0,      // Bench press, push-ups (vigorous)
        back: 6.0,       // Rows, pull-ups (vigorous)
        legs: 6.5,       // Squats, deadlifts (vigorous, more muscle mass)
        shoulders: 5.5,  // Shoulder press, raises
        arms: 5.0,       // Bicep curls, tricep extensions
        abs: 4.5,        // Crunches, planks
        cardio: 8.0      // Running, cycling (moderate to vigorous)
      };

      // Krish's weight from user data (70 kg)
      const userWeight = 70;
      
      // Create realistic workout exercises with actual names
      const workoutExercises = [];
      const exercisesByPart = exercises.filter(e => e.bodyPart === selectedBodyPart);
      
      // Pick 3-5 exercises for this workout
      const numExercises = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < Math.min(numExercises, exercisesByPart.length); j++) {
        const ex = exercisesByPart[j];
        const sets = 3 + Math.floor(Math.random() * 2); // 3-4 sets
        const reps = selectedBodyPart === 'cardio' ? 0 : (8 + Math.floor(Math.random() * 5)); // 8-12 reps
        
        // Calculate calories burned per exercise
        // Formula: Calories = MET × weight (kg) × time (hours)
        // Assume each set takes ~2 minutes including rest
        const timePerSetInHours = 2 / 60; // 2 minutes converted to hours
        const totalTimeInHours = sets * timePerSetInHours;
        
        // For cardio, use longer duration (20-30 minutes total)
        const exerciseTime = selectedBodyPart === 'cardio' 
          ? (20 + Math.random() * 10) / 60  // 20-30 minutes
          : totalTimeInHours;
        
        const met = metValues[selectedBodyPart];
        const caloriesBurned = Math.round(met * userWeight * exerciseTime);
        
        workoutExercises.push({
          name: ex.name,
          sets: sets,
          reps: reps,
          caloriesBurned: caloriesBurned
        });
      }

      if (workoutExercises.length > 0) {
        const totalCalories = workoutExercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
        
        const workout = {
          user: krishId,
          date: date.toISOString().split('T')[0],
          day: dayName,
          name: `${selectedBodyPart.charAt(0).toUpperCase() + selectedBodyPart.slice(1)} Day`,
          exercises: workoutExercises,
          duration: Math.floor(45 + Math.random() * 30),
          totalCaloriesBurned: totalCalories,
          isRestDay: false,
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        workoutLogs.push(workout);
      }
    }

    await db.collection('workouts').deleteMany({ user: krishId });
    if (workoutLogs.length > 0) {
      await db.collection('workouts').insertMany(workoutLogs);
    }
    console.log(`✅ Created ${workoutLogs.length} workout logs`);

    // 4. Create Meal Logs (Past 30 days)
    console.log('\n🍽️  Creating meal logs...');
    const mealLogs = [];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    if (foods.length > 0) {
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Create 3-4 meals per day
        const mealsPerDay = 3 + Math.floor(Math.random() * 2);
        
        for (let m = 0; m < mealsPerDay; m++) {
          const mealType = mealTypes[m % mealTypes.length];
          
          // Pick 1-3 food items per meal
          const numFoods = 1 + Math.floor(Math.random() * 3);
          const mealFoods = [];
          
          for (let f = 0; f < numFoods; f++) {
            const food = foods[Math.floor(Math.random() * foods.length)];
            const quantity = 1 + Math.floor(Math.random() * 2);
            
            mealFoods.push({
              id: food._id.toString(),
              name: food.name,
              calories: food.calories * quantity,
              protein: food.protein * quantity,
              carbs: food.carbs * quantity,
              fat: food.fat * quantity,
              quantity: quantity,
              unit: food.servingUnit
            });
          }

          const totalCalories = mealFoods.reduce((sum, f) => sum + f.calories, 0);
          const totalProtein = mealFoods.reduce((sum, f) => sum + f.protein, 0);
          const totalCarbs = mealFoods.reduce((sum, f) => sum + f.carbs, 0);
          const totalFat = mealFoods.reduce((sum, f) => sum + f.fat, 0);

          const meal = {
            user: krishId,
            date: dateStr,
            mealType: mealType,
            foods: mealFoods,
            totalCalories: Math.round(totalCalories),
            totalProtein: Math.round(totalProtein * 10) / 10,
            totalCarbs: Math.round(totalCarbs * 10) / 10,
            totalFat: Math.round(totalFat * 10) / 10,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          mealLogs.push(meal);
        }
      }

      await db.collection('diets').deleteMany({ user: krishId });
      await db.collection('diets').insertMany(mealLogs);
      console.log(`✅ Created ${mealLogs.length} meal logs across 30 days`);
    } else {
      console.log('⚠️  No foods found, skipping meal logs');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DATA SUMMARY FOR KRISH');
    console.log('='.repeat(60));
    console.log(`👤 User: ${krish.name} (${krish.email})`);
    console.log(`📧 Login: krish@fitnova.com / password123`);
    console.log(`💪 Workout logs: ${workoutLogs.length} sessions (past 30 days)`);
    console.log(`🍽️  Meal logs: ${mealLogs.length} meals (past 30 days)`);
    console.log(`📈 Tracker data: ${trackerLogs.length} entries (past 30 days)`);
    console.log(`⚖️  Weight: ${trackerLogs[trackerLogs.length - 1].weight}kg → ${trackerLogs[0].weight}kg`);
    console.log(`🎯 Goal: Weight ${krish.goal}`);
    console.log('='.repeat(60));

    console.log('\n✨ Test data created successfully!');
    console.log('\n📝 Login with: krish@fitnova.com / password123');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedKrishData();
}

module.exports = seedKrishData;
