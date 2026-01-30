const mongoose = require('mongoose');
require('dotenv').config();
const Exercise = require('../models/Exercise');

const exercises = [
    // --- CHEST ---
    {
        name: 'Push Up',
        bodyPart: 'chest',
        difficulty: 'beginner',
        instructions: ['Start in a plank position.', 'Lower your body until your chest nearly touches the floor.', 'Push back up to the starting position.'],
        defaultSets: 3,
        defaultReps: 12
    },
    {
        name: 'Dumbbell Bench Press',
        bodyPart: 'chest',
        difficulty: 'beginner',
        instructions: ['Lie on a bench with dumbbells in hand.', 'Press the weights up over your chest.', 'Lower them slowly to your sides.'],
        defaultSets: 3,
        defaultReps: 10
    },
    {
        name: 'Incline Dumbbell Press',
        bodyPart: 'chest',
        difficulty: 'intermediate',
        instructions: ['Set bench to 30-45 degrees.', 'Press dumbbells up from chest level.', 'Lower slowly.'],
        defaultSets: 3,
        defaultReps: 10
    },
    {
        name: 'Barbell Bench Press',
        bodyPart: 'chest',
        difficulty: 'intermediate',
        instructions: ['Lie on flat bench.', 'Grip bar slightly wider than shoulder width.', 'Lower bar to chest and press up.'],
        defaultSets: 4,
        defaultReps: 8
    },
    {
        name: 'Weighted Dips',
        bodyPart: 'chest',
        difficulty: 'advanced',
        instructions: ['Use a dip belt to add weight.', 'Lower body until shoulders are below elbows.', 'Push back up.'],
        defaultSets: 3,
        defaultReps: 8
    },
    {
        name: 'Cable Fly',
        bodyPart: 'chest',
        difficulty: 'intermediate',
        instructions: ['Stand between pulleys.', 'Pull handles together in front regarding chest.', 'Return slowly.'],
        defaultSets: 3,
        defaultReps: 15
    },

    // --- BACK ---
    {
        name: 'Lat Pulldown',
        bodyPart: 'back',
        difficulty: 'beginner',
        instructions: ['Sit at machine, grip bar wide.', 'Pull bar down to upper chest.', 'Release slowly.'],
        defaultSets: 3,
        defaultReps: 12
    },
    {
        name: 'Seated Cable Row',
        bodyPart: 'back',
        difficulty: 'beginner',
        instructions: ['Sit with feet on platform.', 'Pull handle to stomach keeping back straight.', 'Return forward.'],
        defaultSets: 3,
        defaultReps: 12
    },
    {
        name: 'Pull Up',
        bodyPart: 'back',
        difficulty: 'intermediate',
        instructions: ['Hang from bar.', 'Pull chin over bar.', 'Lower all the way down.'],
        defaultSets: 3,
        defaultReps: 8
    },
    {
        name: 'Barbell Row',
        bodyPart: 'back',
        difficulty: 'intermediate',
        instructions: ['Bend at hips, back straight.', 'Pull barbell to lower chest.', 'Lower slowly.'],
        defaultSets: 4,
        defaultReps: 10
    },
    {
        name: 'Deadlift',
        bodyPart: 'back',
        difficulty: 'advanced',
        instructions: ['Stand with feet hip-width.', 'Grip bar, lift with legs and back.', 'Stand tall, then lower.'],
        defaultSets: 3,
        defaultReps: 5
    },
    {
        name: 'Single Arm Dumbbell Row',
        bodyPart: 'back',
        difficulty: 'intermediate',
        instructions: ['One knee on bench.', 'Pull dumbbell to hip.', 'Lower slowly.'],
        defaultSets: 3,
        defaultReps: 12
    },

    // --- LEGS ---
    {
        name: 'Bodyweight Squat',
        bodyPart: 'legs',
        difficulty: 'beginner',
        instructions: ['Stand feet shoulder-width.', 'Squat down keeping chest up.', 'Stand back up.'],
        defaultSets: 3,
        defaultReps: 15
    },
    {
        name: 'Lunge',
        bodyPart: 'legs',
        difficulty: 'beginner',
        instructions: ['Step forward with one leg.', 'Lower back knee to ground.', 'Push back to start.'],
        defaultSets: 3,
        defaultReps: 12
    },
    {
        name: 'Barbell Back Squat',
        bodyPart: 'legs',
        difficulty: 'advanced',
        instructions: ['Bar across upper back.', 'Squat deep.', 'Drive up through heels.'],
        defaultSets: 4,
        defaultReps: 8
    },
    {
        name: 'Leg Press',
        bodyPart: 'legs',
        difficulty: 'intermediate',
        instructions: ['Sit in machine.', 'Press platform away.', 'Lower slowly without locking knees.'],
        defaultSets: 3,
        defaultReps: 12
    },
    {
        name: 'Romanian Deadlift',
        bodyPart: 'legs',
        difficulty: 'intermediate',
        instructions: ['Hold bar/dumbbells.', 'Hinge at hips keeping legs slightly bent.', 'Lower until stretch in hamstrings.'],
        defaultSets: 3,
        defaultReps: 10
    },
    {
        name: 'Front Squat',
        bodyPart: 'legs',
        difficulty: 'advanced',
        instructions: ['Bar rests on front delts.', 'Squat keeping elbows high.', 'Drive up.'],
        defaultSets: 4,
        defaultReps: 8
    },

    // --- SHOULDERS ---
    {
        name: 'Dumbbell Shoulder Press',
        bodyPart: 'shoulders',
        difficulty: 'beginner',
        instructions: ['Sit or stand.', 'Press dumbbells overhead.', 'Lower to ear level.'],
        defaultSets: 3,
        defaultReps: 12
    },
    {
        name: 'Lateral Raise',
        bodyPart: 'shoulders',
        difficulty: 'beginner',
        instructions: ['Stand with dumbbells at sides.', 'Raise arms to side until parallel.', 'Lower slowly.'],
        defaultSets: 3,
        defaultReps: 15
    },
    {
        name: 'Overhead Press',
        bodyPart: 'shoulders',
        difficulty: 'advanced',
        instructions: ['Stand with barbell.', 'Press overhead strictly.', 'Lower to collarbone.'],
        defaultSets: 4,
        defaultReps: 6
    },
    {
        name: 'Face Pull',
        bodyPart: 'shoulders',
        difficulty: 'intermediate',
        instructions: ['Use rope on cable.', 'Pull to face, retracting scapula.', 'Release.'],
        defaultSets: 3,
        defaultReps: 15
    },
    {
        name: 'Arnold Press',
        bodyPart: 'shoulders',
        difficulty: 'intermediate',
        instructions: ['Start palms facing you.', 'Press up while rotating palms out.', 'Reverse on way down.'],
        defaultSets: 3,
        defaultReps: 10
    },

    // --- BICEPS ---
    {
        name: 'Dumbbell Curl',
        bodyPart: 'biceps',
        difficulty: 'beginner',
        instructions: ['Hold dumbbells.', 'Curl up towards shoulders.', 'Lower under control.'],
        defaultSets: 3,
        defaultReps: 12
    },
    {
        name: 'Hammer Curl',
        bodyPart: 'biceps',
        difficulty: 'beginner',
        instructions: ['Hold dumbbells with neutral grip.', 'Curl up.', 'Lower.'],
        defaultSets: 3,
        defaultReps: 12
    },
    {
        name: 'Barbell Curl',
        bodyPart: 'biceps',
        difficulty: 'intermediate',
        instructions: ['Stand with barbell.', 'Curl up keeping elbows at sides.', 'Lower.'],
        defaultSets: 3,
        defaultReps: 10
    },
    {
        name: 'Preacher Curl',
        bodyPart: 'biceps',
        difficulty: 'intermediate',
        instructions: ['Use preacher bench.', 'Curl weight up.', 'Extend arm fully.'],
        defaultSets: 3,
        defaultReps: 10
    },
    {
        name: 'Chin Up',
        bodyPart: 'biceps',
        difficulty: 'advanced',
        instructions: ['Hang with underhand grip.', 'Pull chin over bar.', 'Lower.'],
        defaultSets: 3,
        defaultReps: 8
    },

    // --- TRICEPS ---
    {
        name: 'Tricep Pushdown',
        bodyPart: 'triceps',
        difficulty: 'beginner',
        instructions: ['Use cable rope.', 'Push down separating rope at bottom.', 'Return to chest height.'],
        defaultSets: 3,
        defaultReps: 15
    },
    {
        name: 'Bench Dip',
        bodyPart: 'triceps',
        difficulty: 'beginner',
        instructions: ['Hands on bench behind you.', 'Lower hips.', 'Press up.'],
        defaultSets: 3,
        defaultReps: 12
    },
    {
        name: 'Skullcrusher',
        bodyPart: 'triceps',
        difficulty: 'intermediate',
        instructions: ['Lie on bench.', 'Lower bar to forehead.', 'Extend arms.'],
        defaultSets: 3,
        defaultReps: 10
    },
    {
        name: 'Overhead Extension',
        bodyPart: 'triceps',
        difficulty: 'intermediate',
        instructions: ['Hold weight overhead.', 'Lower behind head.', 'Extend up.'],
        defaultSets: 3,
        defaultReps: 12
    },
    {
        name: 'Close Grip Bench Press',
        bodyPart: 'triceps',
        difficulty: 'advanced',
        instructions: ['Bench press with narrow grip.', 'Focus on triceps.', 'Press up.'],
        defaultSets: 4,
        defaultReps: 8
    },

    // --- ABS ---
    {
        name: 'Crunch',
        bodyPart: 'abs',
        difficulty: 'beginner',
        instructions: ['Lie on back.', 'Lift shoulders off ground.', 'Lower.'],
        defaultSets: 3,
        defaultReps: 20
    },
    {
        name: 'Plank',
        bodyPart: 'abs',
        difficulty: 'beginner',
        instructions: ['Hold pushup position on elbows.', 'Keep body straight.', 'Hold for time.'],
        defaultSets: 3,
        defaultReps: 60 // Seconds technically
    },
    {
        name: 'Leg Raise',
        bodyPart: 'abs',
        difficulty: 'intermediate',
        instructions: ['Lie on back.', 'Lift legs until vertical.', 'Lower slowly.'],
        defaultSets: 3,
        defaultReps: 15
    },
    {
        name: 'Russian Twist',
        bodyPart: 'abs',
        difficulty: 'intermediate',
        instructions: ['Sit V-shape.', 'Twist torso side to side.', 'Hold weight for extra challenge.'],
        defaultSets: 3,
        defaultReps: 20
    },
    {
        name: 'Dragon Flag',
        bodyPart: 'abs',
        difficulty: 'advanced',
        instructions: ['Lie on bench holding top.', 'Lift entire body straight up.', 'Lower slowly keeping straight.'],
        defaultSets: 3,
        defaultReps: 5
    },
    {
        name: 'Hanging Leg Raise',
        bodyPart: 'abs',
        difficulty: 'advanced',
        instructions: ['Hang from bar.', 'Lift legs to bar level.', 'Lower.'],
        defaultSets: 3,
        defaultReps: 10
    },

    // --- CARDIO ---
    {
        name: 'Jumping Jacks',
        bodyPart: 'cardio',
        difficulty: 'beginner',
        instructions: ['Jump spreading legs and raising arms.', 'Jump back.'],
        defaultSets: 3,
        defaultReps: 60
    },
    {
        name: 'Burpees',
        bodyPart: 'cardio',
        difficulty: 'intermediate',
        instructions: ['Squat.', 'Kick feet back.', 'Push up.', 'Jump feet in.', 'Jump up.'],
        defaultSets: 3,
        defaultReps: 15
    },
    {
        name: 'High Knees',
        bodyPart: 'cardio',
        difficulty: 'beginner',
        instructions: ['Run in place lifting knees high.'],
        defaultSets: 3,
        defaultReps: 60
    },
    {
        name: 'Mountain Climbers',
        bodyPart: 'cardio',
        difficulty: 'intermediate',
        instructions: ['Plank position.', 'Drive knees to chest alternately.'],
        defaultSets: 3,
        defaultReps: 40
    },
    {
        name: 'Sprints',
        bodyPart: 'cardio',
        difficulty: 'advanced',
        instructions: ['Run at max speed.'],
        defaultSets: 10,
        defaultReps: 100 // meters?
    }
];

const seedExercises = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete all exists
        await Exercise.deleteMany({});
        console.log('Existing exercises cleared.');

        // Insert new
        const result = await Exercise.insertMany(exercises);
        console.log(`Inserted ${result.length} new exercises.`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding exercises:', error);
        process.exit(1);
    }
};

seedExercises();
