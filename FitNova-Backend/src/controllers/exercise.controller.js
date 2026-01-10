const Exercise = require('../models/Exercise');

const getExercises = async (req, res) => {
    try {
        const { bodyPart } = req.query;
        let query = {};
        if (bodyPart) {
            query.bodyPart = bodyPart.toLowerCase();
        }

        const exercises = await Exercise.find(query);
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const seedExercises = async (req, res) => {
    try {
        const count = await Exercise.countDocuments();
        if (count > 0) {
            return res.json({ message: 'Exercises already seeded' });
        }

        const exercises = [
            { name: 'Push Ups', bodyPart: 'chest', defaultSets: 3, defaultReps: 15 },
            { name: 'Bench Press', bodyPart: 'chest', defaultSets: 3, defaultReps: 10 },
            { name: 'Pull Ups', bodyPart: 'back', defaultSets: 3, defaultReps: 8 },
            { name: 'Lat Pulldown', bodyPart: 'back', defaultSets: 3, defaultReps: 12 },
            { name: 'Squats', bodyPart: 'legs', defaultSets: 4, defaultReps: 12 },
            { name: 'Lunges', bodyPart: 'legs', defaultSets: 3, defaultReps: 12 },
            { name: 'Shoulder Press', bodyPart: 'shoulders', defaultSets: 3, defaultReps: 10 },
            { name: 'Lateral Raises', bodyPart: 'shoulders', defaultSets: 3, defaultReps: 15 },
            { name: 'Bicep Curls', bodyPart: 'arms', defaultSets: 3, defaultReps: 12 },
            { name: 'Tricep Dips', bodyPart: 'arms', defaultSets: 3, defaultReps: 12 },
            { name: 'Plank', bodyPart: 'abs', defaultSets: 3, defaultReps: 60 }, // 60 sec
            { name: 'Crunches', bodyPart: 'abs', defaultSets: 3, defaultReps: 20 },
            { name: 'Running', bodyPart: 'cardio', defaultSets: 1, defaultReps: 30 } // 30 min
        ];

        await Exercise.insertMany(exercises);
        res.json({ message: 'Exercises seeded successfully', count: exercises.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getExercises,
    seedExercises
};
