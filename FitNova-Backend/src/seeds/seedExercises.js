const Exercise = require('../models/Exercise');

const commonExercises = [
  // Chest Exercises
  {
    name: 'Bench Press',
    bodyPart: 'chest',
    equipment: 'barbell',
    targetMuscle: 'Pectoralis Major',
    difficulty: 'intermediate',
    defaultSets: 4,
    defaultReps: 8,
    caloriesPerMinute: 7,
    instructions: [
      'Lie flat on a bench with feet on the floor',
      'Grip the barbell slightly wider than shoulder width',
      'Lower the bar to mid-chest',
      'Press back up to starting position'
    ]
  },
  {
    name: 'Push-ups',
    bodyPart: 'chest',
    equipment: 'bodyweight',
    targetMuscle: 'Pectoralis Major',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 15,
    caloriesPerMinute: 6,
    instructions: [
      'Start in plank position with hands shoulder-width apart',
      'Lower your body until chest nearly touches floor',
      'Push back up to starting position',
      'Keep core engaged throughout'
    ]
  },
  {
    name: 'Dumbbell Flyes',
    bodyPart: 'chest',
    equipment: 'dumbbell',
    targetMuscle: 'Pectoralis Major',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 12,
    caloriesPerMinute: 5,
    instructions: [
      'Lie on flat bench holding dumbbells above chest',
      'Lower dumbbells in arc motion to sides',
      'Bring dumbbells back together above chest',
      'Maintain slight bend in elbows'
    ]
  },
  
  // Back Exercises
  {
    name: 'Pull-ups',
    bodyPart: 'back',
    equipment: 'bodyweight',
    targetMuscle: 'Latissimus Dorsi',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 10,
    caloriesPerMinute: 8,
    instructions: [
      'Hang from pull-up bar with palms facing away',
      'Pull yourself up until chin is over bar',
      'Lower back down with control',
      'Keep core tight throughout'
    ]
  },
  {
    name: 'Deadlift',
    bodyPart: 'back',
    equipment: 'barbell',
    targetMuscle: 'Erector Spinae',
    difficulty: 'advanced',
    defaultSets: 4,
    defaultReps: 6,
    caloriesPerMinute: 9,
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend down and grip bar outside knees',
      'Lift by extending hips and knees',
      'Keep back straight, shoulders back'
    ]
  },
  {
    name: 'Barbell Row',
    bodyPart: 'back',
    equipment: 'barbell',
    targetMuscle: 'Latissimus Dorsi',
    difficulty: 'intermediate',
    defaultSets: 4,
    defaultReps: 10,
    caloriesPerMinute: 7,
    instructions: [
      'Bend over with bar hanging at arms length',
      'Pull bar to lower chest',
      'Lower with control',
      'Keep back straight throughout'
    ]
  },
  
  // Legs Exercises
  {
    name: 'Squats',
    bodyPart: 'legs',
    equipment: 'barbell',
    targetMuscle: 'Quadriceps',
    difficulty: 'intermediate',
    defaultSets: 4,
    defaultReps: 10,
    caloriesPerMinute: 8,
    instructions: [
      'Stand with bar on upper back',
      'Feet shoulder-width apart',
      'Lower down by bending knees and hips',
      'Drive back up through heels'
    ]
  },
  {
    name: 'Lunges',
    bodyPart: 'legs',
    equipment: 'bodyweight',
    targetMuscle: 'Quadriceps',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    caloriesPerMinute: 6,
    instructions: [
      'Step forward with one leg',
      'Lower hips until both knees at 90 degrees',
      'Push back to starting position',
      'Alternate legs'
    ]
  },
  {
    name: 'Leg Press',
    bodyPart: 'legs',
    equipment: 'machine',
    targetMuscle: 'Quadriceps',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    caloriesPerMinute: 6,
    instructions: [
      'Sit in leg press machine',
      'Place feet shoulder-width on platform',
      'Lower platform by bending knees',
      'Press back up to starting position'
    ]
  },
  
  // Shoulders Exercises
  {
    name: 'Shoulder Press',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    targetMuscle: 'Deltoids',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 10,
    caloriesPerMinute: 6,
    instructions: [
      'Sit with dumbbells at shoulder height',
      'Press dumbbells overhead',
      'Lower with control to shoulders',
      'Keep core engaged'
    ]
  },
  {
    name: 'Lateral Raises',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    targetMuscle: 'Lateral Deltoid',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 15,
    caloriesPerMinute: 4,
    instructions: [
      'Stand with dumbbells at sides',
      'Raise arms to shoulder height',
      'Lower with control',
      'Keep slight bend in elbows'
    ]
  },
  {
    name: 'Front Raises',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    targetMuscle: 'Anterior Deltoid',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    caloriesPerMinute: 4,
    instructions: [
      'Stand with dumbbells in front of thighs',
      'Raise arms straight forward to shoulder level',
      'Lower with control',
      'Keep core tight'
    ]
  },
  {
    name: 'Rear Delt Fly',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    targetMuscle: 'Posterior Deltoid',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 12,
    caloriesPerMinute: 5,
    instructions: [
      'Bend forward at hips holding dumbbells',
      'Raise arms out to sides',
      'Squeeze shoulder blades together',
      'Lower with control'
    ]
  },
  {
    name: 'Arnold Press',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    targetMuscle: 'Deltoids',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 10,
    caloriesPerMinute: 6,
    instructions: [
      'Start with dumbbells at shoulder level, palms facing you',
      'Press up while rotating palms forward',
      'Lower while rotating palms back to facing you',
      'Keep core engaged throughout'
    ]
  },
  
  // Arms Exercises
  {
    name: 'Bicep Curls',
    bodyPart: 'arms',
    equipment: 'dumbbell',
    targetMuscle: 'Biceps',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    caloriesPerMinute: 4,
    instructions: [
      'Stand with dumbbells at sides',
      'Curl weights up to shoulders',
      'Lower with control',
      'Keep elbows stationary'
    ]
  },
  {
    name: 'Tricep Dips',
    bodyPart: 'arms',
    equipment: 'bodyweight',
    targetMuscle: 'Triceps',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    caloriesPerMinute: 5,
    instructions: [
      'Place hands on bench behind you',
      'Lower body by bending elbows',
      'Push back up to starting position',
      'Keep elbows close to body'
    ]
  },
  {
    name: 'Hammer Curls',
    bodyPart: 'arms',
    equipment: 'dumbbell',
    targetMuscle: 'Biceps',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    caloriesPerMinute: 4,
    instructions: [
      'Hold dumbbells with palms facing each other',
      'Curl weights up to shoulders',
      'Lower with control',
      'Maintain neutral grip throughout'
    ]
  },
  
  // Abs Exercises
  {
    name: 'Plank',
    bodyPart: 'abs',
    equipment: 'bodyweight',
    targetMuscle: 'Core',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 60,
    caloriesPerMinute: 5,
    instructions: [
      'Start in forearm plank position',
      'Keep body in straight line',
      'Hold position for time',
      'Engage core throughout'
    ]
  },
  {
    name: 'Crunches',
    bodyPart: 'abs',
    equipment: 'bodyweight',
    targetMuscle: 'Rectus Abdominis',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 20,
    caloriesPerMinute: 4,
    instructions: [
      'Lie on back with knees bent',
      'Lift shoulders off ground',
      'Lower with control',
      'Keep hands behind head'
    ]
  },
  {
    name: 'Russian Twists',
    bodyPart: 'abs',
    equipment: 'bodyweight',
    targetMuscle: 'Obliques',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 30,
    caloriesPerMinute: 5,
    instructions: [
      'Sit with knees bent, feet off ground',
      'Lean back slightly',
      'Twist torso side to side',
      'Touch ground on each side'
    ]
  },
  
  // Cardio Exercises
  {
    name: 'Running',
    bodyPart: 'cardio',
    equipment: 'none',
    targetMuscle: 'Full Body',
    difficulty: 'beginner',
    defaultSets: 1,
    defaultReps: 30,
    caloriesPerMinute: 10,
    instructions: [
      'Warm up with light jog',
      'Maintain steady pace',
      'Land on midfoot',
      'Keep shoulders relaxed'
    ]
  },
  {
    name: 'Jump Rope',
    bodyPart: 'cardio',
    equipment: 'resistance-band',
    targetMuscle: 'Full Body',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 100,
    caloriesPerMinute: 12,
    instructions: [
      'Hold rope handles at sides',
      'Swing rope overhead',
      'Jump as rope passes under feet',
      'Land softly on balls of feet'
    ]
  },
  {
    name: 'Burpees',
    bodyPart: 'full-body',
    equipment: 'bodyweight',
    targetMuscle: 'Full Body',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 15,
    caloriesPerMinute: 10,
    instructions: [
      'Start standing',
      'Drop to push-up position',
      'Do a push-up',
      'Jump feet to hands and jump up'
    ]
  },
  {
    name: 'Mountain Climbers',
    bodyPart: 'cardio',
    equipment: 'bodyweight',
    targetMuscle: 'Core',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 30,
    caloriesPerMinute: 8,
    instructions: [
      'Start in plank position',
      'Drive knees to chest alternately',
      'Keep hips level',
      'Maintain fast pace'
    ]
  },
  
  // Additional Shoulder Exercises
  {
    name: 'Upright Row',
    bodyPart: 'shoulders',
    equipment: 'barbell',
    targetMuscle: 'Deltoids',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 12,
    caloriesPerMinute: 5,
    instructions: [
      'Hold barbell with hands shoulder-width apart',
      'Pull bar up to chin level',
      'Keep elbows higher than wrists',
      'Lower with control'
    ]
  },
  {
    name: 'Face Pulls',
    bodyPart: 'shoulders',
    equipment: 'cable',
    targetMuscle: 'Posterior Deltoid',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 15,
    caloriesPerMinute: 4,
    instructions: [
      'Set cable to upper chest height',
      'Pull rope towards face',
      'Keep elbows high',
      'Squeeze shoulder blades together'
    ]
  },
  
  // Additional Chest Exercises
  {
    name: 'Incline Bench Press',
    bodyPart: 'chest',
    equipment: 'barbell',
    targetMuscle: 'Upper Pectorals',
    difficulty: 'intermediate',
    defaultSets: 4,
    defaultReps: 8,
    caloriesPerMinute: 7,
    instructions: [
      'Lie on incline bench (30-45 degrees)',
      'Grip barbell slightly wider than shoulders',
      'Lower bar to upper chest',
      'Press back to starting position'
    ]
  },
  {
    name: 'Cable Flyes',
    bodyPart: 'chest',
    equipment: 'cable',
    targetMuscle: 'Pectoralis Major',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 12,
    caloriesPerMinute: 5,
    instructions: [
      'Stand between cable towers',
      'Bring handles together in front of chest',
      'Keep slight bend in elbows',
      'Control the return'
    ]
  },
  
  // Additional Back Exercises
  {
    name: 'T-Bar Row',
    bodyPart: 'back',
    equipment: 'barbell',
    targetMuscle: 'Latissimus Dorsi',
    difficulty: 'intermediate',
    defaultSets: 4,
    defaultReps: 10,
    caloriesPerMinute: 7,
    instructions: [
      'Straddle T-bar with chest supported',
      'Pull bar to chest',
      'Squeeze shoulder blades',
      'Lower with control'
    ]
  },
  {
    name: 'Lat Pulldown',
    bodyPart: 'back',
    equipment: 'machine',
    targetMuscle: 'Latissimus Dorsi',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    caloriesPerMinute: 6,
    instructions: [
      'Sit at lat pulldown machine',
      'Grip bar wider than shoulders',
      'Pull bar down to upper chest',
      'Squeeze lats at bottom'
    ]
  },
  
  // Additional Leg Exercises
  {
    name: 'Romanian Deadlift',
    bodyPart: 'legs',
    equipment: 'barbell',
    targetMuscle: 'Hamstrings',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 10,
    caloriesPerMinute: 7,
    instructions: [
      'Hold barbell at hip level',
      'Hinge at hips keeping back straight',
      'Lower bar to mid-shin',
      'Drive hips forward to return'
    ]
  },
  {
    name: 'Leg Curls',
    bodyPart: 'legs',
    equipment: 'machine',
    targetMuscle: 'Hamstrings',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: 12,
    caloriesPerMinute: 5,
    instructions: [
      'Lie face down on leg curl machine',
      'Curl legs up towards glutes',
      'Squeeze hamstrings at top',
      'Lower with control'
    ]
  },
  {
    name: 'Calf Raises',
    bodyPart: 'legs',
    equipment: 'machine',
    targetMuscle: 'Calves',
    difficulty: 'beginner',
    defaultSets: 4,
    defaultReps: 15,
    caloriesPerMinute: 4,
    instructions: [
      'Stand on calf raise machine',
      'Push up onto toes',
      'Hold at top',
      'Lower heels below platform'
    ]
  },
  
  // Additional Arm Exercises
  {
    name: 'Skull Crushers',
    bodyPart: 'arms',
    equipment: 'barbell',
    targetMuscle: 'Triceps',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 10,
    caloriesPerMinute: 5,
    instructions: [
      'Lie on bench holding barbell above chest',
      'Lower bar to forehead by bending elbows',
      'Keep upper arms stationary',
      'Extend arms back to start'
    ]
  },
  {
    name: 'Preacher Curls',
    bodyPart: 'arms',
    equipment: 'dumbbell',
    targetMuscle: 'Biceps',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: 12,
    caloriesPerMinute: 4,
    instructions: [
      'Sit at preacher bench',
      'Curl weight up',
      'Keep upper arm on pad',
      'Lower with control'
    ]
  }
];

async function seedExercises() {
  try {
    // Clear existing exercises (optional)
    await Exercise.deleteMany({});
    console.log('Cleared existing exercises');

    // Insert new exercises
    const result = await Exercise.insertMany(commonExercises);
    console.log(`✅ Successfully seeded ${result.length} exercises to database`);
    
    return result;
  } catch (error) {
    console.error('❌ Error seeding exercises:', error.message);
    throw error;
  }
}

// If run directly
if (require.main === module) {
  const mongoose = require('mongoose');
  require('dotenv').config();

  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      return seedExercises();
    })
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedExercises;
