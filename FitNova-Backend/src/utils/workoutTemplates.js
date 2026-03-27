const WORKOUT_TEMPLATES = {
    'ppl': {
        name: 'Push/Pull/Legs',
        daysPerWeek: 6,
        levels: {
            'beginner': [
                { 
                    dayOfWeek: 1, 
                    name: 'Push', 
                    exercises: ['Push-up', 'Dumbbell Shoulder Press', 'Incline Dumbbell Press', 'Side Lateral Raise', 'Pushdown', 'Front Raise'] 
                },
                { 
                    dayOfWeek: 2, 
                    name: 'Pull', 
                    exercises: ['Cable Lat Pulldown', 'Seated Cable Row', 'Dumbbell Row', 'Dumbbell Curl', 'Hammer Curl', 'Rear Delt Fly'] 
                },
                { 
                    dayOfWeek: 3, 
                    name: 'Legs', 
                    exercises: ['Goblet Squat', 'Dumbbell Lunge', 'Leg Extension', 'Seated Leg Curl', 'Glute Bridge', 'Calf Raise'] 
                },
                { 
                    dayOfWeek: 4, 
                    name: 'Push', 
                    exercises: ['Dumbbell Bench Press', 'Dumbbell Shoulder Press', 'Dumbbell Fly', 'Front Raise', 'Bench Dip', 'Pushdown'] 
                },
                { 
                    dayOfWeek: 5, 
                    name: 'Pull', 
                    exercises: ['Cable Lat Pulldown', 'Inverted Row', 'Dumbbell Row', 'Band Bicep Curl', 'Hammer Curl', 'Hyperextension'] 
                },
                { 
                    dayOfWeek: 6, 
                    name: 'Legs', 
                    exercises: ['Goblet Squat', 'Dumbbell Step Up', 'Leg Extension', 'Glute Bridge', 'Seated Leg Curl', 'Standing Calf Raise'] 
                }
            ],
            'intermediate': [
                { 
                    dayOfWeek: 1, 
                    name: 'Push (Power)', 
                    exercises: ['Barbell Bench Press', 'Overhead Press', 'Incline Dumbbell Press', 'Side Lateral Raise', 'Dips', 'Pushdown', 'Overhead Tricep Extension'] 
                },
                { 
                    dayOfWeek: 2, 
                    name: 'Pull (Power)', 
                    exercises: ['Barbell Deadlift', 'Pull-up', 'Bent Over Barbell Row', 'T-Bar Row', 'Face Pull', 'Barbell Curl', 'Hammer Curl'] 
                },
                { 
                    dayOfWeek: 3, 
                    name: 'Legs (Power)', 
                    exercises: ['Barbell Squat', 'Romainian Deadlift', 'Sled 45 Degree Leg Press', 'Bulgarian Split Squat', 'Lying Leg Curls', 'Standing Calf Raise', 'Seated Calf Raise'] 
                },
                { 
                    dayOfWeek: 4, 
                    name: 'Push (Hypertrophy)', 
                    exercises: ['Incline Barbell Bench Press', 'Seated Dumbbell Press', 'Cable Crossover', 'Side Lateral Raise', 'Pec Deck', 'Barbell Lying Triceps Extension', 'Cable Kickback'] 
                },
                { 
                    dayOfWeek: 5, 
                    name: 'Pull (Hypertrophy)', 
                    exercises: ['Cable Lat Pulldown', 'Seated Cable Row', 'Single Arm Dumbbell Row', 'Straight-Arm Pulldown', 'Preacher Curl', 'Cable Curl', 'Reverse Barbell Curl'] 
                },
                { 
                    dayOfWeek: 6, 
                    name: 'Legs (Hypertrophy)', 
                    exercises: ['Front Squat', 'Dumbbell Walking Lunge', 'Leg Extension', 'Seated Leg Curl', 'Glute Bridge', 'Standing Calf Raise', 'Seated Calf Raise'] 
                }
            ],
            'advanced': [
                { 
                    dayOfWeek: 1, 
                    name: 'Push A', 
                    exercises: ['Barbell Bench Press', 'Incline Barbell Bench Press', 'Weighted Dips', 'Seated Dumbbell Press', 'Side Lateral Raise', 'Cable Crossover', 'Close-Grip Bench Press', 'Pushdown'] 
                },
                { 
                    dayOfWeek: 2, 
                    name: 'Pull A', 
                    exercises: ['Barbell Deadlift', 'Weighted Pull-up', 'Bent Over Barbell Row', 'T-Bar Row', 'Face Pull', 'Rear Delt Fly', 'Barbell Curl', 'Hammer Curl'] 
                },
                { 
                    dayOfWeek: 3, 
                    name: 'Legs A', 
                    exercises: ['Barbell Squat', 'Front Squat', 'Romainian Deadlift', 'Dumbbell Walking Lunge', 'Leg Extension', 'Lying Leg Curls', 'Standing Calf Raise', 'Seated Calf Raise'] 
                },
                { 
                    dayOfWeek: 4, 
                    name: 'Push B', 
                    exercises: ['Incline Barbell Bench Press', 'Overhead Press', 'Decline Barbell Bench Press', 'Arnold Press', 'Egyptian Lateral Raise', 'Pec Deck', 'Barbell Lying Triceps Extension', 'Single Arm Cable Extension'] 
                },
                { 
                    dayOfWeek: 5, 
                    name: 'Pull B', 
                    exercises: ['Pendlay Row', 'Weighted Pull-up', 'Meadows Row', 'Cable Lat Pulldown', 'Straight-Arm Pulldown', 'Face Pull', 'Spider Curl', 'Concentration Curl', 'Cable Curl'] 
                },
                { 
                    dayOfWeek: 6, 
                    name: 'Legs B', 
                    exercises: ['Hack Squat', 'Bulgarian Split Squat', 'Sled 45 Degree Leg Press', 'Barbell Good Morning', 'Leg Extension', 'Seated Leg Curl', 'Donkey Calf Raise', 'Standing Calf Raise'] 
                }
            ]
        }
    },
    'bro': {
        name: 'Bro Split',
        daysPerWeek: 6,
        levels: {
            'beginner': [
                { 
                    dayOfWeek: 1, 
                    name: 'Chest', 
                    exercises: ['Push-up', 'Dumbbell Bench Press', 'Incline Dumbbell Press', 'Dumbbell Fly', 'Pec Deck'] 
                },
                { 
                    dayOfWeek: 2, 
                    name: 'Biceps', 
                    exercises: ['Dumbbell Curl', 'Hammer Curl', 'Band Bicep Curl', 'Concentration Curl'] 
                },
                { 
                    dayOfWeek: 3, 
                    name: 'Back', 
                    exercises: ['Cable Lat Pulldown', 'Seated Cable Row', 'Dumbbell Row', 'Hyperextension', 'Inverted Row'] 
                },
                { 
                    dayOfWeek: 4, 
                    name: 'Shoulders', 
                    exercises: ['Dumbbell Shoulder Press', 'Side Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Dumbbell Shrug'] 
                },
                { 
                    dayOfWeek: 5, 
                    name: 'Triceps', 
                    exercises: ['Pushdown', 'Bench Dip', 'Overhead Tricep Extension', 'Cable Kickback'] 
                },
                { 
                    dayOfWeek: 6, 
                    name: 'Legs', 
                    exercises: ['Goblet Squat', 'Dumbbell Lunge', 'Leg Extension', 'Seated Leg Curl', 'Glute Bridge', 'Calf Raise'] 
                }
            ],
            'intermediate': [
                { 
                    dayOfWeek: 1, 
                    name: 'Chest', 
                    exercises: ['Barbell Bench Press', 'Incline Barbell Bench Press', 'Dumbbell Fly', 'Cable Crossover', 'Dips', 'Pec Deck'] 
                },
                { 
                    dayOfWeek: 2, 
                    name: 'Biceps', 
                    exercises: ['Barbell Curl', 'Incline Dumbbell Curl', 'Preacher Curl', 'Hammer Curl', 'Cable Curl'] 
                },
                { 
                    dayOfWeek: 3, 
                    name: 'Back', 
                    exercises: ['Barbell Deadlift', 'Pull-up', 'Bent Over Barbell Row', 'T-Bar Row', 'Seated Cable Row', 'Face Pull', 'Hyperextension'] 
                },
                { 
                    dayOfWeek: 4, 
                    name: 'Shoulders', 
                    exercises: ['Overhead Press', 'Seated Dumbbell Press', 'Arnold Press', 'Side Lateral Raise', 'Rear Delt Fly', 'Upright Row', 'Dumbbell Shrug'] 
                },
                { 
                    dayOfWeek: 5, 
                    name: 'Triceps', 
                    exercises: ['Close-Grip Bench Press', 'Barbell Lying Triceps Extension', 'Pushdown', 'Overhead Tricep Extension', 'Cable Kickback'] 
                },
                { 
                    dayOfWeek: 6, 
                    name: 'Legs', 
                    exercises: ['Barbell Squat', 'Romainian Deadlift', 'Sled 45 Degree Leg Press', 'Bulgarian Split Squat', 'Leg Extension', 'Lying Leg Curls', 'Standing Calf Raise', 'Seated Calf Raise'] 
                }
            ],
            'advanced': [
                { 
                    dayOfWeek: 1, 
                    name: 'Chest', 
                    exercises: ['Barbell Bench Press', 'Incline Barbell Bench Press', 'Decline Barbell Bench Press', 'Weighted Dips', 'Cable Crossover', 'Dumbbell Fly', 'Pec Deck'] 
                },
                { 
                    dayOfWeek: 2, 
                    name: 'Biceps', 
                    exercises: ['Barbell Curl', 'Spider Curl', 'Incline Dumbbell Curl', 'Cable Curl', 'Concentration Curl', 'Preacher Curl'] 
                },
                { 
                    dayOfWeek: 3, 
                    name: 'Back', 
                    exercises: ['Barbell Deadlift', 'Weighted Pull-up', 'Pendlay Row', 'T-Bar Row', 'Meadows Row', 'Cable Lat Pulldown', 'Straight-Arm Pulldown', 'Hyperextension'] 
                },
                { 
                    dayOfWeek: 4, 
                    name: 'Shoulders', 
                    exercises: ['Seated Barbell Press', 'Military Press', 'Arnold Press', 'Side Lateral Raise', 'Egyptian Lateral Raise', 'Rear Delt Fly', 'Cable Upright Row', 'Dumbbell Shrug'] 
                },
                { 
                    dayOfWeek: 5, 
                    name: 'Triceps', 
                    exercises: ['Close-Grip Bench Press', 'Barbell Lying Triceps Extension', 'Weighted Dips', 'Cable Kickback', 'Single Arm Cable Extension', 'Pushdown'] 
                },
                { 
                    dayOfWeek: 6, 
                    name: 'Legs', 
                    exercises: ['Barbell Squat', 'Front Squat', 'Hack Squat', 'Romainian Deadlift', 'Bulgarian Split Squat', 'Leg Extension', 'Lying Leg Curls', 'Sissy Squat', 'Standing Calf Raise', 'Donkey Calf Raise'] 
                }
            ]
        }
    },
    'upper-lower': {
        name: 'Upper/Lower',
        daysPerWeek: 4,
        levels: {
            'beginner': [
                { 
                    dayOfWeek: 1, 
                    name: 'Upper A', 
                    exercises: ['Push-up', 'Dumbbell Bench Press', 'Cable Lat Pulldown', 'Seated Cable Row', 'Dumbbell Shoulder Press', 'Dumbbell Curl', 'Pushdown'] 
                },
                { 
                    dayOfWeek: 2, 
                    name: 'Lower A', 
                    exercises: ['Goblet Squat', 'Dumbbell Lunge', 'Leg Extension', 'Seated Leg Curl', 'Glute Bridge', 'Calf Raise'] 
                },
                { 
                    dayOfWeek: 4, 
                    name: 'Upper B', 
                    exercises: ['Dumbbell Bench Press', 'Dumbbell Fly', 'Dumbbell Row', 'Cable Lat Pulldown', 'Side Lateral Raise', 'Hammer Curl', 'Bench Dip'] 
                },
                { 
                    dayOfWeek: 5, 
                    name: 'Lower B', 
                    exercises: ['Goblet Squat', 'Dumbbell Step Up', 'Leg Extension', 'Glute Bridge', 'Seated Leg Curl', 'Standing Calf Raise'] 
                }
            ],
            'intermediate': [
                { 
                    dayOfWeek: 1, 
                    name: 'Upper Power', 
                    exercises: ['Barbell Bench Press', 'Bent Over Barbell Row', 'Overhead Press', 'Pull-up', 'Dips', 'Barbell Curl', 'Barbell Lying Triceps Extension', 'Face Pull'] 
                },
                { 
                    dayOfWeek: 2, 
                    name: 'Lower Power', 
                    exercises: ['Barbell Squat', 'Romainian Deadlift', 'Sled 45 Degree Leg Press', 'Leg Extension', 'Lying Leg Curls', 'Standing Calf Raise', 'Hanging Leg Raise'] 
                },
                { 
                    dayOfWeek: 4, 
                    name: 'Upper Hypertrophy', 
                    exercises: ['Incline Dumbbell Press', 'Cable Crossover', 'Cable Lat Pulldown', 'Seated Cable Row', 'Arnold Press', 'Side Lateral Raise', 'Preacher Curl', 'Pushdown'] 
                },
                { 
                    dayOfWeek: 5, 
                    name: 'Lower Hypertrophy', 
                    exercises: ['Front Squat', 'Bulgarian Split Squat', 'Dumbbell Walking Lunge', 'Leg Extension', 'Seated Leg Curl', 'Glute Bridge', 'Seated Calf Raise', 'Cable Crunch'] 
                }
            ],
            'advanced': [
                { 
                    dayOfWeek: 1, 
                    name: 'Upper A (Power)', 
                    exercises: ['Barbell Bench Press', 'Weighted Pull-up', 'Overhead Press', 'Bent Over Barbell Row', 'Weighted Dips', 'T-Bar Row', 'Barbell Curl', 'Close-Grip Bench Press', 'Face Pull'] 
                },
                { 
                    dayOfWeek: 2, 
                    name: 'Lower A (Power)', 
                    exercises: ['Barbell Squat', 'Barbell Deadlift', 'Front Squat', 'Romainian Deadlift', 'Leg Extension', 'Standing Calf Raise', 'Hanging Leg Raise'] 
                },
                { 
                    dayOfWeek: 4, 
                    name: 'Upper B (Hypertrophy)', 
                    exercises: ['Incline Barbell Bench Press', 'Cable Lat Pulldown', 'Seated Dumbbell Press', 'Meadows Row', 'Cable Crossover', 'Straight-Arm Pulldown', 'Arnold Press', 'Spider Curl', 'Barbell Lying Triceps Extension', 'Rear Delt Fly'] 
                },
                { 
                    dayOfWeek: 5, 
                    name: 'Lower B (Hypertrophy)', 
                    exercises: ['Hack Squat', 'Bulgarian Split Squat', 'Barbell Good Morning', 'Dumbbell Walking Lunge', 'Leg Extension', 'Lying Leg Curls', 'Seated Calf Raise', 'Donkey Calf Raise', 'Cable Crunch'] 
                }
            ]
        }
    },
    'full-body': {
        name: 'Full Body',
        daysPerWeek: 3,
        levels: {
            'beginner': [
                { 
                    dayOfWeek: 1, 
                    name: 'Full Body A', 
                    exercises: ['Goblet Squat', 'Push-up', 'Cable Lat Pulldown', 'Dumbbell Shoulder Press', 'Dumbbell Curl', 'Pushdown', 'Front Plank', 'Calf Raise'] 
                },
                { 
                    dayOfWeek: 3, 
                    name: 'Full Body B', 
                    exercises: ['Dumbbell Lunge', 'Dumbbell Bench Press', 'Seated Cable Row', 'Side Lateral Raise', 'Hammer Curl', 'Bench Dip', 'Crunch', 'Glute Bridge'] 
                },
                { 
                    dayOfWeek: 5, 
                    name: 'Full Body C', 
                    exercises: ['Goblet Squat', 'Dumbbell Fly', 'Dumbbell Row', 'Front Raise', 'Band Bicep Curl', 'Overhead Tricep Extension', 'Side Plank', 'Leg Extension'] 
                }
            ],
            'intermediate': [
                { 
                    dayOfWeek: 1, 
                    name: 'Full Body A', 
                    exercises: ['Barbell Squat', 'Barbell Bench Press', 'Bent Over Barbell Row', 'Overhead Press', 'Romainian Deadlift', 'Barbell Curl', 'Pushdown', 'Hanging Leg Raise', 'Calf Raise'] 
                },
                { 
                    dayOfWeek: 3, 
                    name: 'Full Body B', 
                    exercises: ['Sled 45 Degree Leg Press', 'Incline Dumbbell Press', 'Pull-up', 'Seated Dumbbell Press', 'Bulgarian Split Squat', 'Preacher Curl', 'Dips', 'Cable Crunch', 'Standing Calf Raise'] 
                },
                { 
                    dayOfWeek: 5, 
                    name: 'Full Body C', 
                    exercises: ['Front Squat', 'Cable Crossover', 'T-Bar Row', 'Arnold Press', 'Dumbbell Walking Lunge', 'Cable Curl', 'Barbell Lying Triceps Extension', 'Russian Twist', 'Seated Calf Raise'] 
                }
            ],
            'advanced': [
                { 
                    dayOfWeek: 1, 
                    name: 'Full Body Heavy', 
                    exercises: ['Barbell Squat', 'Barbell Bench Press', 'Barbell Deadlift', 'Overhead Press', 'Weighted Pull-up', 'Romainian Deadlift', 'Barbell Curl', 'Close-Grip Bench Press', 'Hanging Leg Raise', 'Standing Calf Raise'] 
                },
                { 
                    dayOfWeek: 3, 
                    name: 'Full Body Medium', 
                    exercises: ['Front Squat', 'Incline Barbell Bench Press', 'Pendlay Row', 'Seated Barbell Press', 'Hack Squat', 'Weighted Dips', 'Spider Curl', 'Cable Kickback', 'Cable Crunch', 'Donkey Calf Raise'] 
                },
                { 
                    dayOfWeek: 5, 
                    name: 'Full Body Light', 
                    exercises: ['Bulgarian Split Squat', 'Cable Crossover', 'Cable Lat Pulldown', 'Arnold Press', 'Dumbbell Walking Lunge', 'Pec Deck', 'Concentration Curl', 'Single Arm Cable Extension', 'Ab Wheel Rollout', 'Seated Calf Raise'] 
                }
            ]
        }
    }
};

module.exports = WORKOUT_TEMPLATES;
