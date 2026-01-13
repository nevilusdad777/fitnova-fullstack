const Exercise = require('../models/Exercise');

// Get all exercises with optional filters
const getAllExercises = async (req, res) => {
  try {
    const { bodyPart, difficulty, equipment } = req.query;
    let filter = {};

    if (bodyPart) {
      filter.bodyPart = bodyPart;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (equipment) {
      filter.equipment = equipment;
    }

    const exercises = await Exercise.find(filter)
      .sort({ name: 1 });

    res.json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching exercises',
      error: error.message
    });
  }
};

// Legacy support for existing code
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

// Search exercises by name
const searchExercises = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const exercises = await Exercise.find({
      $text: { $search: query }
    }).limit(20);

    res.json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching exercises',
      error: error.message
    });
  }
};

// Get exercise by ID
const getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    res.json({
      success: true,
      data: exercise
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching exercise',
      error: error.message
    });
  }
};

// Get exercises by body part
const getExercisesByBodyPart = async (req, res) => {
  try {
    const { bodyPart } = req.params;

    const exercises = await Exercise.find({ bodyPart })
      .sort({ difficulty: 1, name: 1 });

    res.json({
      success: true,
      count: exercises.length,
      bodyPart: bodyPart,
      data: exercises
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching exercises',
      error: error.message
    });
  }
};

// Get body parts
const getBodyParts = async (req, res) => {
  try {
    const bodyParts = await Exercise.distinct('bodyPart');

    res.json({
      success: true,
      data: bodyParts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching body parts',
      error: error.message
    });
  }
};

// Get exercise equipment types
const getEquipmentTypes = async (req, res) => {
  try {
    const equipment = await Exercise.distinct('equipment');

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching equipment types',
      error: error.message
    });
  }
};

// Legacy seed function (keeping for compatibility)
const seedExercises = async (req, res) => {
  try {
    const count = await Exercise.countDocuments();
    if (count > 0) {
      return res.json({ message: 'Exercises already seeded. Use the seed script for advanced seeding.' });
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
      { name: 'Plank', bodyPart: 'abs', defaultSets: 3, defaultReps: 60 },
      { name: 'Crunches', bodyPart: 'abs', defaultSets: 3, defaultReps: 20 },
      { name: 'Running', bodyPart: 'cardio', defaultSets: 1, defaultReps: 30 }
    ];

    await Exercise.insertMany(exercises);
    res.json({ message: 'Exercises seeded successfully', count: exercises.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExercises,
  getAllExercises,
  searchExercises,
  getExerciseById,
  getExercisesByBodyPart,
  getBodyParts,
  getEquipmentTypes,
  seedExercises
};
