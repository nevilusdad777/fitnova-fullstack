const WORKOUT_TEMPLATES = {
    'ppl': {
        name: 'Push/Pull/Legs',
        daysPerWeek: 6,
        levels: {
            'beginner': [
                { dayOfWeek: 1, name: 'Push', exercises: ['Push-up', 'Dumbbell Shoulder Press', 'Bench Dip'] },
                { dayOfWeek: 2, name: 'Pull', exercises: ['Pull-up', 'Dumbbell Row', 'Dumbbell Curl'] },
                { dayOfWeek: 3, name: 'Legs', exercises: ['Goblet Squat', 'Dumbbell Lunge', 'Calf Raise'] },
                { dayOfWeek: 4, name: 'Push', exercises: ['Push-up', 'Side Lateral Raise', 'Bench Dip'] },
                { dayOfWeek: 5, name: 'Pull', exercises: ['Cable Lat Pulldown', 'Bent Over Barbell Row', 'Hammer Curl'] }, 
                { dayOfWeek: 6, name: 'Legs', exercises: ['Sled 45 Degree Leg Press', 'Glute Bridge', 'Calf Raise'] }
            ],
            'intermediate': [
                { dayOfWeek: 1, name: 'Push (Power)', exercises: ['Barbell Bench Press', 'Overhead Press', 'Incline Dumbbell Press', 'Bench Dip'] },
                { dayOfWeek: 2, name: 'Pull (Power)', exercises: ['Barbell Deadlift', 'Pull-up', 'Bent Over Barbell Row', 'Face Pull'] },
                { dayOfWeek: 3, name: 'Legs (Power)', exercises: ['Barbell Squat', 'Romainian Deadlift', 'Sled 45 Degree Leg Press', 'Calf Raise'] },
                { dayOfWeek: 4, name: 'Push (Hypertrophy)', exercises: ['Incline Barbell Bench Press', 'Side Lateral Raise', 'Cable Crossover', 'Barbell Lying Triceps Extension', 'Pushdown'] },
                { dayOfWeek: 5, name: 'Pull (Hypertrophy)', exercises: ['Cable Lat Pulldown', 'Seated Cable Row', 'T-Bar Row', 'Hammer Curl', 'Preacher Curl'] },
                { dayOfWeek: 6, name: 'Legs (Hypertrophy)', exercises: ['Front Squat', 'Dumbbell Lunge', 'Seated Leg Curl', 'Leg Extension', 'Seated Calf Raise'] }
            ],
            'advanced': [
                { dayOfWeek: 1, name: 'Push A', exercises: ['Barbell Bench Press', 'Incline Barbell Bench Press', 'Seated Dumbbell Press', 'Side Lateral Raise', 'Pushdown'] },
                { dayOfWeek: 2, name: 'Pull A', exercises: ['Weighted Pull-up', 'Bent Over Barbell Row', 'Single Arm Dumbbell Row', 'Rear Delt Fly', 'Barbell Curl'] },
                { dayOfWeek: 3, name: 'Legs A', exercises: ['Barbell Squat', 'Hack Squat', 'Romainian Deadlift', 'Dumbbell Walking Lunge', 'Standing Calf Raise'] },
                { dayOfWeek: 4, name: 'Push B', exercises: ['Overhead Press', 'Dips', 'Cable Crossover', 'Upright Row', 'Overhead Tricep Extension'] },
                { dayOfWeek: 5, name: 'Pull B', exercises: ['Barbell Deadlift', 'Cable Lat Pulldown', 'Seated Cable Row', 'Face Pull', 'Hammer Curl', 'Concentration Curl'] },
                { dayOfWeek: 6, name: 'Legs B', exercises: ['Front Squat', 'Sled 45 Degree Leg Press', 'Seated Leg Curl', 'Leg Extension', 'Seated Calf Raise'] }
            ]
        }
    },
    'bro': {
        name: 'Bro Split',
        daysPerWeek: 6,
        levels: {
            'beginner': [
                { dayOfWeek: 1, name: 'Chest', exercises: ['Push-up', 'Dumbbell Bench Press', 'Dumbbell Fly'] },
                { dayOfWeek: 2, name: 'Biceps', exercises: ['Dumbbell Curl', 'Hammer Curl', 'Band Bicep Curl'] },
                { dayOfWeek: 3, name: 'Back', exercises: ['Cable Lat Pulldown', 'Seated Cable Row', 'Hyperextension'] },
                { dayOfWeek: 4, name: 'Shoulders', exercises: ['Dumbbell Shoulder Press', 'Side Lateral Raise', 'Front Raise'] },
                { dayOfWeek: 5, name: 'Triceps', exercises: ['Bench Dip', 'Pushdown', 'Dumbbell Kickback'] },
                { dayOfWeek: 6, name: 'Legs', exercises: ['Goblet Squat', 'Dumbbell Lunge', 'Calf Raise'] }
            ],
            'intermediate': [
                { dayOfWeek: 1, name: 'Chest', exercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Cable Crossover', 'Dips'] },
                { dayOfWeek: 2, name: 'Biceps', exercises: ['Barbell Curl', 'Incline Dumbbell Curl', 'Preacher Curl', 'Reverse Barbell Curl'] },
                { dayOfWeek: 3, name: 'Back', exercises: ['Pull-up', 'Bent Over Barbell Row', 'Cable Lat Pulldown', 'Single Arm Dumbbell Row'] },
                { dayOfWeek: 4, name: 'Shoulders', exercises: ['Overhead Press', 'Arnold Press', 'Side Lateral Raise', 'Face Pull'] },
                { dayOfWeek: 5, name: 'Triceps', exercises: ['Close-Grip Bench Press', 'Barbell Lying Triceps Extension', 'Pushdown', 'Overhead Tricep Extension'] },
                { dayOfWeek: 6, name: 'Legs', exercises: ['Barbell Squat', 'Sled 45 Degree Leg Press', 'Romainian Deadlift', 'Seated Leg Curl', 'Leg Extension', 'Calf Raise'] }
            ],
            'advanced': [
                { dayOfWeek: 1, name: 'Chest', exercises: ['Barbell Bench Press', 'Incline Barbell Bench Press', 'Weighted Dips', 'Cable Crossover', 'Pec Deck'] },
                { dayOfWeek: 2, name: 'Biceps', exercises: ['Barbell Curl', 'Spider Curl', 'Hammer Curl', 'Cable Curl', 'Concentration Curl'] },
                { dayOfWeek: 3, name: 'Back', exercises: ['Barbell Deadlift', 'Weighted Pull-up', 'T-Bar Row', 'Meadows Row', 'Straight-Arm Pulldown'] },
                { dayOfWeek: 4, name: 'Shoulders', exercises: ['Seated Barbell Press', 'Egyptian Lateral Raise', 'Rear Delt Fly', 'Cable Upright Row', 'Dumbbell Shrug'] },
                { dayOfWeek: 5, name: 'Triceps', exercises: ['Barbell Lying Triceps Extension', 'Weighted Dips', 'Cable Kickback', 'Pushdown', 'Single Arm Cable Extension'] },
                { dayOfWeek: 6, name: 'Legs', exercises: ['Barbell Squat', 'Hack Squat', 'Bulgarian Split Squat', 'Romainian Deadlift', 'Sissy Squat', 'Donkey Calf Raise'] }
            ]
        }
    },
    'upper-lower': {
        name: 'Upper/Lower',
        daysPerWeek: 4,
        levels: {
            'beginner': [
                { dayOfWeek: 1, name: 'Upper', exercises: ['Push-up', 'Cable Lat Pulldown', 'Dumbbell Shoulder Press', 'Dumbbell Curl'] },
                { dayOfWeek: 2, name: 'Lower', exercises: ['Goblet Squat', 'Dumbbell Lunge', 'Glute Bridge', 'Calf Raise'] },
                { dayOfWeek: 4, name: 'Upper', exercises: ['Dumbbell Bench Press', 'Seated Cable Row', 'Side Lateral Raise', 'Bench Dip'] },
                { dayOfWeek: 5, name: 'Lower', exercises: ['Sled 45 Degree Leg Press', 'Dumbbell Step Up', 'Seated Leg Curl', 'Calf Raise'] }
            ],
            'intermediate': [
                { dayOfWeek: 1, name: 'Upper Power', exercises: ['Barbell Bench Press', 'Bent Over Barbell Row', 'Overhead Press', 'Pull-up', 'Barbell Curl'] },
                { dayOfWeek: 2, name: 'Lower Power', exercises: ['Barbell Squat', 'Romainian Deadlift', 'Sled 45 Degree Leg Press', 'Hanging Leg Raise'] },
                { dayOfWeek: 4, name: 'Upper Hypertrophy', exercises: ['Incline Dumbbell Press', 'Cable Lat Pulldown', 'Side Lateral Raise', 'Pushdown', 'Hammer Curl'] },
                { dayOfWeek: 5, name: 'Lower Hypertrophy', exercises: ['Front Squat', 'Dumbbell Lunge', 'Seated Leg Curl', 'Leg Extension', 'Calf Raise'] }
            ],
            'advanced': [
                { dayOfWeek: 1, name: 'Upper A', exercises: ['Barbell Bench Press', 'T-Bar Row', 'Seated Dumbbell Press', 'Weighted Pull-up', 'Barbell Lying Triceps Extension', 'Preacher Curl'] },
                { dayOfWeek: 2, name: 'Lower A', exercises: ['Barbell Squat', 'Barbell Good Morning', 'Hack Squat', 'Standing Calf Raise', 'Cable Crunch'] },
                { dayOfWeek: 4, name: 'Upper B', exercises: ['Overhead Press', 'Weighted Dips', 'Meadows Row', 'Face Pull', 'Incline Dumbbell Curl', 'Overhead Tricep Extension'] },
                { dayOfWeek: 5, name: 'Lower B', exercises: ['Barbell Deadlift', 'Front Squat', 'Bulgarian Split Squat', 'Lying Leg Curls', 'Seated Calf Raise'] }
            ]
        }
    },
    'full-body': {
        name: 'Full Body',
        daysPerWeek: 3,
        levels: {
            'beginner': [
                { dayOfWeek: 1, name: 'Full Body A', exercises: ['Goblet Squat', 'Push-up', 'Cable Lat Pulldown', 'Front Plank'] },
                { dayOfWeek: 3, name: 'Full Body B', exercises: ['Dumbbell Lunge', 'Dumbbell Shoulder Press', 'Seated Cable Row', 'Crunch'] },
                { dayOfWeek: 5, name: 'Full Body C', exercises: ['Sled 45 Degree Leg Press', 'Dumbbell Bench Press', 'Dumbbell Row', 'Side Plank'] }
            ],
            'intermediate': [
                { dayOfWeek: 1, name: 'Full Body A', exercises: ['Barbell Squat', 'Barbell Bench Press', 'Bent Over Barbell Row', 'Overhead Press', 'Barbell Curl', 'Barbell Lying Triceps Extension'] },
                { dayOfWeek: 3, name: 'Full Body B', exercises: ['Barbell Deadlift', 'Incline Barbell Bench Press', 'Pull-up', 'Side Lateral Raise', 'Hammer Curl', 'Dips'] },
                { dayOfWeek: 5, name: 'Full Body C', exercises: ['Front Squat', 'Dips', 'Chin-up', 'Face Pull', 'Dumbbell Lunge', 'Calf Raise'] }
            ],
            'advanced': [
                { dayOfWeek: 1, name: 'Full Body Heavy', exercises: ['Barbell Squat', 'Barbell Bench Press', 'Pendlay Row', 'Military Press', 'Barbell Curl'] },
                { dayOfWeek: 3, name: 'Full Body Medium', exercises: ['Front Squat', 'Incline Dumbbell Press', 'Pull-up', 'Arnold Press', 'Dips'] },
                { dayOfWeek: 5, name: 'Full Body Light', exercises: ['Sled 45 Degree Leg Press', 'Push-up', 'Inverted Row', 'Side Lateral Raise', 'Pushdown', 'Spider Curl'] }
            ]
        }
    }
};

module.exports = WORKOUT_TEMPLATES;
