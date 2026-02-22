const mongoose = require('mongoose');
require('dotenv').config();
const Exercise = require('../models/Exercise');

const exercises = [
    // ==================== CHEST ====================
    // Beginner
    {
        name: 'Push-up',
        bodyPart: 'chest',
        equipment: 'bodyweight',
        targetMuscle: 'Pectorals, Triceps, Anterior Deltoids',
        difficulty: 'beginner',
        description: 'Classic bodyweight chest exercise',
        instructions: ['Start in a plank position with hands shoulder-width apart', 'Lower your body until chest nearly touches the floor', 'Push back up to starting position', 'Keep core tight throughout'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 7
    },
    {
        name: 'Dumbbell Bench Press',
        bodyPart: 'chest',
        equipment: 'dumbbell',
        targetMuscle: 'Pectorals',
        difficulty: 'beginner',
        instructions: ['Lie on flat bench with dumbbells at chest level', 'Press weights up until arms are extended', 'Lower slowly back to chest level'],
        defaultSets: 3,
        defaultReps: 10,
        caloriesPerMinute: 6
    },
    {
        name: 'Dumbbell Fly',
        bodyPart: 'chest',
        equipment: 'dumbbell',
        targetMuscle: 'Pectorals',
        difficulty: 'beginner',
        instructions: ['Lie on bench with dumbbells above chest', 'Lower weights out to sides in arc motion', 'Bring back together at top'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 5
    },
    
    // Intermediate
    {
        name: 'Barbell Bench Press',
        bodyPart: 'chest',
        equipment: 'barbell',
        targetMuscle: 'Pectorals',
        difficulty: 'intermediate',
        instructions: ['Lie on flat bench, grip bar slightly wider than shoulders', 'Lower bar to mid-chest', 'Press up explosively', 'Keep feet planted'],
        defaultSets: 4,
        defaultReps: 8,
        caloriesPerMinute: 8
    },
    {
        name: 'Incline Barbell Bench Press',
        bodyPart: 'chest',
        equipment: 'barbell',
        targetMuscle: 'Upper Pectorals',
        difficulty: 'intermediate',
        instructions: ['Set bench to 30-45 degrees', 'Grip bar slightly wider than shoulders', 'Lower to upper chest', 'Press up'],
        defaultSets: 4,
        defaultReps: 8,
        caloriesPerMinute: 8
    },
    {
        name: 'Incline Dumbbell Press',
        bodyPart: 'chest',
        equipment: 'dumbbell',
        targetMuscle: 'Upper Pectorals',
        difficulty: 'intermediate',
        instructions: ['Set bench to 30-45 degrees', 'Press dumbbells up from chest level', 'Lower slowly with control'],
        defaultSets: 3,
        defaultReps: 10,
        caloriesPerMinute: 7
    },
    {
        name: 'Cable Crossover',
        bodyPart: 'chest',
        equipment: 'cable',
        targetMuscle: 'Pectorals',
        difficulty: 'intermediate',
        instructions: ['Stand between cable towers', 'Pull handles together in front of chest', 'Squeeze at peak contraction', 'Return slowly'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 6
    },
    {
        name: 'Dips',
        bodyPart: 'chest',
        equipment: 'bodyweight',
        targetMuscle: 'Lower Pectorals, Triceps',
        difficulty: 'intermediate',
        instructions: ['Grip parallel bars', 'Lower body by bending elbows', 'Lean forward for chest emphasis', 'Push back up'],
        defaultSets: 3,
        defaultReps: 10,
        caloriesPerMinute: 7
    },
    
    // Advanced
    {
        name: 'Weighted Dips',
        bodyPart: 'chest',
        equipment: 'bodyweight',
        targetMuscle: 'Lower Pectorals, Triceps',
        difficulty: 'advanced',
        instructions: ['Use dip belt to add weight', 'Lower until shoulders below elbows', 'Lean forward', 'Press up powerfully'],
        defaultSets: 4,
        defaultReps: 8,
        caloriesPerMinute: 9
    },
    {
        name: 'Decline Barbell Bench Press',
        bodyPart: 'chest',
        equipment: 'barbell',
        targetMuscle: 'Lower Pectorals',
        difficulty: 'advanced',
        instructions: ['Set bench to decline position', 'Lower bar to lower chest', 'Press up explosively'],
        defaultSets: 4,
        defaultReps: 8,
        caloriesPerMinute: 8
    },
    {
        name: 'Pec Deck',
        bodyPart: 'chest',
        equipment: 'machine',
        targetMuscle: 'Pectorals',
        difficulty: 'beginner',
        instructions: ['Sit with back against pad', 'Bring handles together in front', 'Squeeze chest', 'Return slowly'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 5
    },

    // ==================== BACK ====================
    // Beginner
    {
        name: 'Cable Lat Pulldown',
        bodyPart: 'back',
        equipment: 'cable',
        targetMuscle: 'Latissimus Dorsi',
        difficulty: 'beginner',
        instructions: ['Sit at machine with wide grip', 'Pull bar down to upper chest', 'Squeeze shoulder blades', 'Release slowly'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 6
    },
    {
        name: 'Seated Cable Row',
        bodyPart: 'back',
        equipment: 'cable',
        targetMuscle: 'Middle Back, Lats',
        difficulty: 'beginner',
        instructions: ['Sit with feet on platform', 'Pull handle to stomach', 'Keep back straight', 'Squeeze shoulder blades'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 6
    },
    {
        name: 'Dumbbell Row',
        bodyPart: 'back',
        equipment: 'dumbbell',
        targetMuscle: 'Lats, Rhomboids',
        difficulty: 'beginner',
        instructions: ['Place one knee on bench', 'Pull dumbbell to hip', 'Keep back flat', 'Lower slowly'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 6
    },
    {
        name: 'Hyperextension',
        bodyPart: 'back',
        equipment: 'bodyweight',
        targetMuscle: 'Lower Back, Glutes',
        difficulty: 'beginner',
        instructions: ['Position yourself on hyperextension bench', 'Lower torso down', 'Raise back up to parallel', 'Keep movement controlled'],
        defaultSets: 3,
        defaultReps: 15,
        caloriesPerMinute: 5
    },

    // Intermediate
    {
        name: 'Pull-up',
        bodyPart: 'back',
        equipment: 'bodyweight',
        targetMuscle: 'Lats, Biceps',
        difficulty: 'intermediate',
        instructions: ['Hang from bar with overhand grip', 'Pull chin over bar', 'Lower all the way down', 'Avoid swinging'],
        defaultSets: 3,
        defaultReps: 8,
        caloriesPerMinute: 8
    },
    {
        name: 'Bent Over Barbell Row',
        bodyPart: 'back',
        equipment: 'barbell',
        targetMuscle: 'Lats, Rhomboids, Traps',
        difficulty: 'intermediate',
        instructions: ['Bend at hips with back straight', 'Pull barbell to lower chest', 'Squeeze shoulder blades', 'Lower slowly'],
        defaultSets: 4,
        defaultReps: 10,
        caloriesPerMinute: 7
    },
    {
        name: 'T-Bar Row',
        bodyPart: 'back',
        equipment: 'barbell',
        targetMuscle: 'Middle Back, Lats',
        difficulty: 'intermediate',
        instructions: ['Straddle T-bar', 'Pull bar to chest', 'Keep back straight', 'Lower with control'],
        defaultSets: 4,
        defaultReps: 10,
        caloriesPerMinute: 7
    },
    {
        name: 'Single Arm Dumbbell Row',
        bodyPart: 'back',
        equipment: 'dumbbell',
        targetMuscle: 'Lats, Rhomboids',
        difficulty: 'intermediate',
        instructions: ['One knee and hand on bench', 'Pull dumbbell to hip', 'Focus on squeezing back', 'Lower slowly'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 6
    },
    {
        name: 'Face Pull',
        bodyPart: 'back',
        equipment: 'cable',
        targetMuscle: 'Rear Deltoids, Traps',
        difficulty: 'intermediate',
        instructions: ['Use rope attachment on cable', 'Pull to face level', 'Retract shoulder blades', 'Focus on rear delts'],
        defaultSets: 3,
        defaultReps: 15,
        caloriesPerMinute: 5
    },

    // Advanced
    {
        name: 'Barbell Deadlift',
        bodyPart: 'back',
        equipment: 'barbell',
        targetMuscle: 'Entire Back, Glutes, Hamstrings',
        difficulty: 'advanced',
        instructions: ['Stand with feet hip-width', 'Grip bar outside legs', 'Lift with legs and back', 'Stand tall', 'Lower with control'],
        defaultSets: 4,
        defaultReps: 5,
        caloriesPerMinute: 10
    },
    {
        name: 'Weighted Pull-up',
        bodyPart: 'back',
        equipment: 'bodyweight',
        targetMuscle: 'Lats, Biceps',
        difficulty: 'advanced',
        instructions: ['Add weight with belt or vest', 'Pull chin over bar', 'Lower all the way down', 'Control the movement'],
        defaultSets: 4,
        defaultReps: 6,
        caloriesPerMinute: 9
    },
    {
        name: 'Pendlay Row',
        bodyPart: 'back',
        equipment: 'barbell',
        targetMuscle: 'Upper Back, Lats',
        difficulty: 'advanced',
        instructions: ['Barbell starts on floor each rep', 'Pull explosively to chest', 'Return to floor', 'Reset position'],
        defaultSets: 4,
        defaultReps: 8,
        caloriesPerMinute: 8
    },
    {
        name: 'Meadows Row',
        bodyPart: 'back',
        equipment: 'barbell',
        targetMuscle: 'Lats, Upper Back',
        difficulty: 'advanced',
        instructions: ['Stand perpendicular to barbell', 'Pull bar to hip', 'Focus on lat contraction', 'Lower slowly'],
        defaultSets: 3,
        defaultReps: 10,
        caloriesPerMinute: 7
    },
    {
        name: 'Straight-Arm Pulldown',
        bodyPart: 'back',
        equipment: 'cable',
        targetMuscle: 'Lats',
        difficulty: 'intermediate',
        instructions: ['Stand at cable with straight arms', 'Pull bar down to thighs', 'Keep arms straight', 'Focus on lats'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 5
    },
    {
        name: 'Chin-up',
        bodyPart: 'back',
        equipment: 'bodyweight',
        targetMuscle: 'Lats, Biceps',
        difficulty: 'intermediate',
        instructions: ['Hang with underhand grip', 'Pull chin over bar', 'Lower with control', 'Full range of motion'],
        defaultSets: 3,
        defaultReps: 8,
        caloriesPerMinute: 8
    },
    {
        name: 'Inverted Row',
        bodyPart: 'back',
        equipment: 'bodyweight',
        targetMuscle: 'Middle Back, Lats',
        difficulty: 'beginner',
        instructions: ['Hang under bar at waist height', 'Pull chest to bar', 'Keep body straight', 'Lower slowly'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 6
    },

    // ==================== LEGS ====================
    // Beginner
    {
        name: 'Goblet Squat',
        bodyPart: 'legs',
        equipment: 'dumbbell',
        targetMuscle: 'Quadriceps, Glutes',
        difficulty: 'beginner',
        instructions: ['Hold dumbbell at chest', 'Squat down keeping chest up', 'Drive through heels', 'Stand back up'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 7
    },
    {
        name: 'Dumbbell Lunge',
        bodyPart: 'legs',
        equipment: 'dumbbell',
        targetMuscle: 'Quadriceps, Glutes',
        difficulty: 'beginner',
        instructions: ['Hold dumbbells at sides', 'Step forward and lower back knee', 'Push back to start', 'Alternate legs'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 7
    },
    {
        name: 'Leg Extension',
        bodyPart: 'legs',
        equipment: 'machine',
        targetMuscle: 'Quadriceps',
        difficulty: 'beginner',
        instructions: ['Sit in machine', 'Extend legs fully', 'Squeeze quads at top', 'Lower slowly'],
        defaultSets: 3,
        defaultReps: 15,
        caloriesPerMinute: 5
    },
    {
        name: 'Seated Leg Curl',
        bodyPart: 'legs',
        equipment: 'machine',
        targetMuscle: 'Hamstrings',
        difficulty: 'beginner',
        instructions: ['Sit in machine', 'Curl legs down', 'Squeeze hamstrings', 'Return slowly'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 5
    },
    {
        name: 'Calf Raise',
        bodyPart: 'legs',
        equipment: 'bodyweight',
        targetMuscle: 'Calves',
        difficulty: 'beginner',
        instructions: ['Stand on edge of step', 'Raise up on toes', 'Lower heels below step level', 'Repeat'],
        defaultSets: 4,
        defaultReps: 20,
        caloriesPerMinute: 4
    },
    {
        name: 'Glute Bridge',
        bodyPart: 'legs',
        equipment: 'bodyweight',
        targetMuscle: 'Glutes, Hamstrings',
        difficulty: 'beginner',
        instructions: ['Lie on back with knees bent', 'Lift hips up', 'Squeeze glutes at top', 'Lower slowly'],
        defaultSets: 3,
        defaultReps: 15,
        caloriesPerMinute: 5
    },

    // Intermediate
    {
        name: 'Barbell Squat',
        bodyPart: 'legs',
        equipment: 'barbell',
        targetMuscle: 'Quadriceps, Glutes, Hamstrings',
        difficulty: 'intermediate',
        instructions: ['Bar across upper back', 'Squat down keeping chest up', 'Go parallel or below', 'Drive up through heels'],
        defaultSets: 4,
        defaultReps: 8,
        caloriesPerMinute: 9
    },
    {
        name: 'Romainian Deadlift',
        bodyPart: 'legs',
        equipment: 'barbell',
        targetMuscle: 'Hamstrings, Glutes, Lower Back',
        difficulty: 'intermediate',
        instructions: ['Hold barbell at thighs', 'Hinge at hips keeping back straight', 'Lower until hamstring stretch', 'Drive hips forward to stand'],
        defaultSets: 4,
        defaultReps: 10,
        caloriesPerMinute: 7
    },
    {
        name: 'Sled 45 Degree Leg Press',
        bodyPart: 'legs',
        equipment: 'machine',
        targetMuscle: 'Quadriceps, Glutes',
        difficulty: 'intermediate',
        instructions: ['Sit in machine with feet on platform', 'Press platform away', 'Lower slowly without locking knees', 'Keep back against pad'],
        defaultSets: 4,
        defaultReps: 12,
        caloriesPerMinute: 7
    },
    {
        name: 'Bulgarian Split Squat',
        bodyPart: 'legs',
        equipment: 'dumbbell',
        targetMuscle: 'Quadriceps, Glutes',
        difficulty: 'intermediate',
        instructions: ['Rear foot elevated on bench', 'Lower down on front leg', 'Drive through front heel', 'Keep torso upright'],
        defaultSets: 3,
        defaultReps: 10,
        caloriesPerMinute: 7
    },
    {
        name: 'Dumbbell Walking Lunge',
        bodyPart: 'legs',
        equipment: 'dumbbell',
        targetMuscle: 'Quadriceps, Glutes',
        difficulty: 'intermediate',
        instructions: ['Hold dumbbells at sides', 'Step forward into lunge', 'Continue walking forward', 'Alternate legs'],
        defaultSets: 3,
        defaultReps: 20,
        caloriesPerMinute: 8
    },
    {
        name: 'Lying Leg Curls',
        bodyPart: 'legs',
        equipment: 'machine',
        targetMuscle: 'Hamstrings',
        difficulty: 'intermediate',
        instructions: ['Lie face down on machine', 'Curl legs up to glutes', 'Squeeze hamstrings', 'Lower slowly'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 5
    },
    {
        name: 'Standing Calf Raise',
        bodyPart: 'legs',
        equipment: 'machine',
        targetMuscle: 'Calves',
        difficulty: 'intermediate',
        instructions: ['Stand in calf raise machine', 'Raise up on toes', 'Hold peak contraction', 'Lower slowly'],
        defaultSets: 4,
        defaultReps: 15,
        caloriesPerMinute: 5
    },

    // Advanced
    {
        name: 'Front Squat',
        bodyPart: 'legs',
        equipment: 'barbell',
        targetMuscle: 'Quadriceps, Core',
        difficulty: 'advanced',
        instructions: ['Bar rests on front delts', 'Keep elbows high', 'Squat down', 'Drive up explosively'],
        defaultSets: 4,
        defaultReps: 8,
        caloriesPerMinute: 9
    },
    {
        name: 'Hack Squat',
        bodyPart: 'legs',
        equipment: 'machine',
        targetMuscle: 'Quadriceps',
        difficulty: 'advanced',
        instructions: ['Position in hack squat machine', 'Lower down keeping back against pad', 'Drive through heels', 'Extend fully at top'],
        defaultSets: 4,
        defaultReps: 10,
        caloriesPerMinute: 8
    },
    {
        name: 'Barbell Good Morning',
        bodyPart: 'legs',
        equipment: 'barbell',
        targetMuscle: 'Hamstrings, Lower Back',
        difficulty: 'advanced',
        instructions: ['Bar across upper back', 'Hinge at hips keeping legs straight', 'Lower torso parallel to ground', 'Return to standing'],
        defaultSets: 3,
        defaultReps: 10,
        caloriesPerMinute: 7
    },
    {
        name: 'Sissy Squat',
        bodyPart: 'legs',
        equipment: 'bodyweight',
        targetMuscle: 'Quadriceps',
        difficulty: 'advanced',
        instructions: ['Hold support for balance', 'Lean back while bending knees', 'Lower down keeping hips extended', 'Push back up'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 6
    },
    {
        name: 'Seated Calf Raise',
        bodyPart: 'legs',
        equipment: 'machine',
        targetMuscle: 'Soleus (Calves)',
        difficulty: 'beginner',
        instructions: ['Sit in machine with weight on knees', 'Raise up on toes', 'Lower heels below platform', 'Repeat'],
        defaultSets: 4,
        defaultReps: 20,
        caloriesPerMinute: 4
    },
    {
        name: 'Donkey Calf Raise',
        bodyPart: 'legs',
        equipment: 'machine',
        targetMuscle: 'Calves',
        difficulty: 'advanced',
        instructions: ['Bend at hips on machine', 'Raise up on toes', 'Full range of motion', 'Lower slowly'],
        defaultSets: 4,
        defaultReps: 15,
        caloriesPerMinute: 5
    },
    {
        name: 'Dumbbell Step Up',
        bodyPart: 'legs',
        equipment: 'dumbbell',
        targetMuscle: 'Quadriceps, Glutes',
        difficulty: 'beginner',
        instructions: ['Hold dumbbells at sides', 'Step up onto box or bench', 'Drive through heel', 'Step down and repeat'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 7
    },

    // ==================== SHOULDERS ====================
    // Beginner
    {
        name: 'Dumbbell Shoulder Press',
        bodyPart: 'shoulders',
        equipment: 'dumbbell',
        targetMuscle: 'Deltoids',
        difficulty: 'beginner',
        instructions: ['Sit or stand with dumbbells at shoulders', 'Press overhead', 'Lower to ear level', 'Keep core tight'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 6
    },
    {
        name: 'Side Lateral Raise',
        bodyPart: 'shoulders',
        equipment: 'dumbbell',
        targetMuscle: 'Lateral Deltoids',
        difficulty: 'beginner',
        instructions: ['Stand with dumbbells at sides', 'Raise arms to sides until parallel', 'Lower slowly', 'Keep slight bend in elbows'],
        defaultSets: 3,
        defaultReps: 15,
        caloriesPerMinute: 5
    },
    {
        name: 'Front Raise',
        bodyPart: 'shoulders',
        equipment: 'dumbbell',
        targetMuscle: 'Anterior Deltoids',
        difficulty: 'beginner',
        instructions: ['Hold dumbbells in front of thighs', 'Raise arms forward to shoulder height', 'Lower slowly', 'Alternate or both together'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 5
    },
    {
        name: 'Rear Delt Fly',
        bodyPart: 'shoulders',
        equipment: 'dumbbell',
        targetMuscle: 'Posterior Deltoids',
        difficulty: 'beginner',
        instructions: ['Bend at hips with dumbbells hanging', 'Raise arms out to sides', 'Squeeze shoulder blades', 'Lower slowly'],
        defaultSets: 3,
        defaultReps: 15,
        caloriesPerMinute: 5
    },

    // Intermediate
    {
        name: 'Overhead Press',
        bodyPart: 'shoulders',
        equipment: 'barbell',
        targetMuscle: 'Deltoids, Triceps',
        difficulty: 'intermediate',
        instructions: ['Stand with barbell at shoulders', 'Press overhead strictly', 'Lower to collarbone', 'Keep core braced'],
        defaultSets: 4,
        defaultReps: 8,
        caloriesPerMinute: 7
    },
    {
        name: 'Seated Dumbbell Press',
        bodyPart: 'shoulders',
        equipment: 'dumbbell',
        targetMuscle: 'Deltoids',
        difficulty: 'intermediate',
        instructions: ['Sit on bench with back support', 'Press dumbbells overhead', 'Lower to ear level', 'Press back up'],
        defaultSets: 4,
        defaultReps: 10,
        caloriesPerMinute: 6
    },
    {
        name: 'Arnold Press',
        bodyPart: 'shoulders',
        equipment: 'dumbbell',
        targetMuscle: 'Deltoids',
        difficulty: 'intermediate',
        instructions: ['Start with palms facing you at shoulders', 'Press up while rotating palms out', 'Reverse motion on way down', 'Full range of motion'],
        defaultSets: 3,
        defaultReps: 10,
        caloriesPerMinute: 6
    },
    {
        name: 'Upright Row',
        bodyPart: 'shoulders',
        equipment: 'barbell',
        targetMuscle: 'Deltoids, Traps',
        difficulty: 'intermediate',
        instructions: ['Hold barbell at thighs', 'Pull up to chin level', 'Keep elbows high', 'Lower slowly'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 6
    },
    {
        name: 'Cable Upright Row',
        bodyPart: 'shoulders',
        equipment: 'cable',
        targetMuscle: 'Deltoids, Traps',
        difficulty: 'intermediate',
        instructions: ['Use cable with straight bar', 'Pull to chin level', 'Keep elbows high', 'Control the descent'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 6
    },

    // Advanced
    {
        name: 'Seated Barbell Press',
        bodyPart: 'shoulders',
        equipment: 'barbell',
        targetMuscle: 'Deltoids',
        difficulty: 'advanced',
        instructions: ['Sit on bench with back support', 'Press barbell overhead', 'Lower behind head or to front', 'Press back up'],
        defaultSets: 4,
        defaultReps: 8,
        caloriesPerMinute: 7
    },
    {
        name: 'Egyptian Lateral Raise',
        bodyPart: 'shoulders',
        equipment: 'cable',
        targetMuscle: 'Lateral Deltoids',
        difficulty: 'advanced',
        instructions: ['Stand with cable behind back', 'Raise arm out to side', 'Unique angle for lateral delts', 'Control the movement'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 5
    },
    {
        name: 'Dumbbell Shrug',
        bodyPart: 'shoulders',
        equipment: 'dumbbell',
        targetMuscle: 'Trapezius',
        difficulty: 'intermediate',
        instructions: ['Hold dumbbells at sides', 'Shrug shoulders up to ears', 'Hold peak contraction', 'Lower slowly'],
        defaultSets: 4,
        defaultReps: 15,
        caloriesPerMinute: 5
    },
    {
        name: 'Military Press',
        bodyPart: 'shoulders',
        equipment: 'barbell',
        targetMuscle: 'Deltoids',
        difficulty: 'advanced',
        instructions: ['Stand at attention with barbell', 'Press overhead strictly', 'No leg drive', 'Lower to collarbone'],
        defaultSets: 4,
        defaultReps: 6,
        caloriesPerMinute: 7
    },

    // ==================== BICEPS ====================
    // Beginner
    {
        name: 'Dumbbell Curl',
        bodyPart: 'biceps',
        equipment: 'dumbbell',
        targetMuscle: 'Biceps',
        difficulty: 'beginner',
        instructions: ['Hold dumbbells at sides', 'Curl up towards shoulders', 'Squeeze at top', 'Lower under control'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 5
    },
    {
        name: 'Hammer Curl',
        bodyPart: 'biceps',
        equipment: 'dumbbell',
        targetMuscle: 'Biceps, Brachialis',
        difficulty: 'beginner',
        instructions: ['Hold dumbbells with neutral grip', 'Curl up keeping palms facing', 'Squeeze at top', 'Lower slowly'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 5
    },
    {
        name: 'Band Bicep Curl',
        bodyPart: 'biceps',
        equipment: 'resistance-band',
        targetMuscle: 'Biceps',
        difficulty: 'beginner',
        instructions: ['Stand on band', 'Hold handles at sides', 'Curl up', 'Control the descent'],
        defaultSets: 3,
        defaultReps: 15,
        caloriesPerMinute: 4
    },

    // Intermediate
    {
        name: 'Barbell Curl',
        bodyPart: 'biceps',
        equipment: 'barbell',
        targetMuscle: 'Biceps',
        difficulty: 'intermediate',
        instructions: ['Stand with barbell at thighs', 'Curl up keeping elbows at sides', 'Squeeze at top', 'Lower slowly'],
        defaultSets: 3,
        defaultReps: 10,
        caloriesPerMinute: 6
    },
    {
        name: 'Preacher Curl',
        bodyPart: 'biceps',
        equipment: 'barbell',
        targetMuscle: 'Biceps',
        difficulty: 'intermediate',
        instructions: ['Use preacher bench', 'Curl weight up', 'Squeeze at top', 'Extend arm fully'],
        defaultSets: 3,
        defaultReps: 10,
        caloriesPerMinute: 5
    },
    {
        name: 'Incline Dumbbell Curl',
        bodyPart: 'biceps',
        equipment: 'dumbbell',
        targetMuscle: 'Biceps',
        difficulty: 'intermediate',
        instructions: ['Lie back on incline bench', 'Let arms hang straight', 'Curl up', 'Full stretch at bottom'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 5
    },
    {
        name: 'Cable Curl',
        bodyPart: 'biceps',
        equipment: 'cable',
        targetMuscle: 'Biceps',
        difficulty: 'intermediate',
        instructions: ['Use cable with straight bar', 'Curl up keeping elbows stationary', 'Squeeze at top', 'Control the descent'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 5
    },
    {
        name: 'Reverse Barbell Curl',
        bodyPart: 'biceps',
        equipment: 'barbell',
        targetMuscle: 'Brachialis, Forearms',
        difficulty: 'intermediate',
        instructions: ['Hold barbell with overhand grip', 'Curl up', 'Keep wrists straight', 'Lower slowly'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 5
    },

    // Advanced
    {
        name: 'Spider Curl',
        bodyPart: 'biceps',
        equipment: 'barbell',
        targetMuscle: 'Biceps',
        difficulty: 'advanced',
        instructions: ['Lie face down on incline bench', 'Arms hanging straight', 'Curl up', 'Strict form'],
        defaultSets: 3,
        defaultReps: 10,
        caloriesPerMinute: 5
    },
    {
        name: 'Concentration Curl',
        bodyPart: 'biceps',
        equipment: 'dumbbell',
        targetMuscle: 'Biceps',
        difficulty: 'intermediate',
        instructions: ['Sit with elbow braced on inner thigh', 'Curl up focusing on bicep', 'Squeeze at top', 'Lower slowly'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 4
    },

    // ==================== TRICEPS ====================
    // Beginner
    {
        name: 'Pushdown',
        bodyPart: 'triceps',
        equipment: 'cable',
        targetMuscle: 'Triceps',
        difficulty: 'beginner',
        instructions: ['Use cable with rope or bar', 'Push down extending arms', 'Keep elbows at sides', 'Return to chest height'],
        defaultSets: 3,
        defaultReps: 15,
        caloriesPerMinute: 5
    },
    {
        name: 'Bench Dip',
        bodyPart: 'triceps',
        equipment: 'bodyweight',
        targetMuscle: 'Triceps',
        difficulty: 'beginner',
        instructions: ['Hands on bench behind you', 'Lower hips down', 'Press back up', 'Keep elbows close'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 6
    },
    {
        name: 'Dumbbell Kickback',
        bodyPart: 'triceps',
        equipment: 'dumbbell',
        targetMuscle: 'Triceps',
        difficulty: 'beginner',
        instructions: ['Bend at hips', 'Extend arm back', 'Squeeze tricep at top', 'Lower slowly'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 4
    },

    // Intermediate
    {
        name: 'Barbell Lying Triceps Extension',
        bodyPart: 'triceps',
        equipment: 'barbell',
        targetMuscle: 'Triceps',
        difficulty: 'intermediate',
        instructions: ['Lie on bench holding barbell', 'Lower to forehead (skullcrusher)', 'Extend arms back up', 'Keep elbows stationary'],
        defaultSets: 3,
        defaultReps: 10,
        caloriesPerMinute: 6
    },
    {
        name: 'Overhead Tricep Extension',
        bodyPart: 'triceps',
        equipment: 'dumbbell',
        targetMuscle: 'Triceps',
        difficulty: 'intermediate',
        instructions: ['Hold weight overhead', 'Lower behind head', 'Extend back up', 'Keep elbows close to head'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 5
    },
    {
        name: 'Cable Kickback',
        bodyPart: 'triceps',
        equipment: 'cable',
        targetMuscle: 'Triceps',
        difficulty: 'intermediate',
        instructions: ['Use low cable', 'Extend arm back', 'Squeeze at full extension', 'Control the return'],
        defaultSets: 3,
        defaultReps: 15,
        caloriesPerMinute: 5
    },

    // Advanced
    {
        name: 'Close-Grip Bench Press',
        bodyPart: 'triceps',
        equipment: 'barbell',
        targetMuscle: 'Triceps, Chest',
        difficulty: 'advanced',
        instructions: ['Bench press with narrow grip', 'Lower to lower chest', 'Focus on triceps', 'Press up explosively'],
        defaultSets: 4,
        defaultReps: 8,
        caloriesPerMinute: 7
    },
    {
        name: 'Single Arm Cable Extension',
        bodyPart: 'triceps',
        equipment: 'cable',
        targetMuscle: 'Triceps',
        difficulty: 'advanced',
        instructions: ['Use single handle on cable', 'Extend arm down', 'Focus on tricep contraction', 'Control the movement'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 5
    },

    // ==================== ABS/CORE ====================
    // Beginner
    {
        name: 'Crunch',
        bodyPart: 'abs',
        equipment: 'bodyweight',
        targetMuscle: 'Rectus Abdominis',
        difficulty: 'beginner',
        instructions: ['Lie on back with knees bent', 'Lift shoulders off ground', 'Squeeze abs', 'Lower slowly'],
        defaultSets: 3,
        defaultReps: 20,
        caloriesPerMinute: 4
    },
    {
        name: 'Front Plank',
        bodyPart: 'abs',
        equipment: 'bodyweight',
        targetMuscle: 'Core',
        difficulty: 'beginner',
        instructions: ['Hold pushup position on elbows', 'Keep body straight', 'Brace core', 'Hold for time'],
        defaultSets: 3,
        defaultReps: 60,
        caloriesPerMinute: 5
    },
    {
        name: 'Side Plank',
        bodyPart: 'abs',
        equipment: 'bodyweight',
        targetMuscle: 'Obliques',
        difficulty: 'beginner',
        instructions: ['Lie on side on elbow', 'Lift hips off ground', 'Keep body straight', 'Hold for time'],
        defaultSets: 3,
        defaultReps: 45,
        caloriesPerMinute: 5
    },

    // Intermediate
    {
        name: 'Hanging Leg Raise',
        bodyPart: 'abs',
        equipment: 'bodyweight',
        targetMuscle: 'Lower Abs',
        difficulty: 'intermediate',
        instructions: ['Hang from pull-up bar', 'Raise legs to parallel', 'Lower slowly', 'Avoid swinging'],
        defaultSets: 3,
        defaultReps: 12,
        caloriesPerMinute: 6
    },
    {
        name: 'Cable Crunch',
        bodyPart: 'abs',
        equipment: 'cable',
        targetMuscle: 'Rectus Abdominis',
        difficulty: 'intermediate',
        instructions: ['Kneel at cable with rope', 'Crunch down bringing elbows to knees', 'Squeeze abs', 'Return slowly'],
        defaultSets: 3,
        defaultReps: 15,
        caloriesPerMinute: 5
    },
    {
        name: 'Russian Twist',
        bodyPart: 'abs',
        equipment: 'bodyweight',
        targetMuscle: 'Obliques',
        difficulty: 'intermediate',
        instructions: ['Sit in V-position', 'Twist torso side to side', 'Hold weight for challenge', 'Keep feet elevated'],
        defaultSets: 3,
        defaultReps: 30,
        caloriesPerMinute: 5
    },
    {
        name: 'Ab Wheel Rollout',
        bodyPart: 'abs',
        equipment: 'bodyweight',
        targetMuscle: 'Core',
        difficulty: 'advanced',
        instructions: ['Kneel with ab wheel', 'Roll forward extending body', 'Keep core tight', 'Roll back to start'],
        defaultSets: 3,
        defaultReps: 10,
        caloriesPerMinute: 7
    },

    // Advanced
    {
        name: 'Dragon Flag',
        bodyPart: 'abs',
        equipment: 'bodyweight',
        targetMuscle: 'Core',
        difficulty: 'advanced',
        instructions: ['Lie on bench holding behind head', 'Lift entire body straight up', 'Lower slowly keeping straight', 'Advanced core exercise'],
        defaultSets: 3,
        defaultReps: 5,
        caloriesPerMinute: 8
    },

    // ==================== CARDIO ====================
    {
        name: 'Jumping Jacks',
        bodyPart: 'cardio',
        equipment: 'bodyweight',
        targetMuscle: 'Full Body',
        difficulty: 'beginner',
        instructions: ['Jump spreading legs and raising arms', 'Jump back to start', 'Maintain rhythm'],
        defaultSets: 3,
        defaultReps: 60,
        caloriesPerMinute: 8
    },
    {
        name: 'Burpees',
        bodyPart: 'cardio',
        equipment: 'bodyweight',
        targetMuscle: 'Full Body',
        difficulty: 'intermediate',
        instructions: ['Squat down', 'Kick feet back to plank', 'Do push-up', 'Jump feet in', 'Jump up'],
        defaultSets: 3,
        defaultReps: 15,
        caloriesPerMinute: 10
    },
    {
        name: 'High Knees',
        bodyPart: 'cardio',
        equipment: 'bodyweight',
        targetMuscle: 'Legs, Cardio',
        difficulty: 'beginner',
        instructions: ['Run in place', 'Lift knees high', 'Pump arms', 'Fast pace'],
        defaultSets: 3,
        defaultReps: 60,
        caloriesPerMinute: 9
    },
    {
        name: 'Mountain Climbers',
        bodyPart: 'cardio',
        equipment: 'bodyweight',
        targetMuscle: 'Core, Cardio',
        difficulty: 'intermediate',
        instructions: ['Start in plank position', 'Drive knees to chest alternately', 'Keep hips low', 'Fast pace'],
        defaultSets: 3,
        defaultReps: 40,
        caloriesPerMinute: 9
    }
];

const seedExercises = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Delete all existing exercises
        await Exercise.deleteMany({});
        console.log('🗑️  Existing exercises cleared');

        // Insert new comprehensive exercise library
        const result = await Exercise.insertMany(exercises);
        console.log(`\n🎉 Successfully inserted ${result.length} exercises!`);
        
        // Show breakdown by body part
        const breakdown = exercises.reduce((acc, ex) => {
            acc[ex.bodyPart] = (acc[ex.bodyPart] || 0) + 1;
            return acc;
        }, {});
        
        console.log('\n📊 Exercise Breakdown by Body Part:');
        Object.entries(breakdown).forEach(([part, count]) => {
            console.log(`   ${part}: ${count} exercises`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding exercises:', error);
        process.exit(1);
    }
};

seedExercises();
