const Exercise = require('../models/Exercise');

// @desc    Get all exercises with pagination
// @route   GET /admin/exercises
// @access  Private (Admin)
const getAllExercises = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const bodyPart = req.query.bodyPart || '';
    const difficulty = req.query.difficulty || '';

    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (bodyPart) {
      query.bodyPart = bodyPart;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    const exercises = await Exercise.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await Exercise.countDocuments(query);

    res.json({
      exercises,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalExercises: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single exercise by ID
// @route   GET /admin/exercises/:id
// @access  Private (Admin)
const getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new exercise
// @route   POST /admin/exercises
// @access  Private (Admin)
const createExercise = async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    res.status(201).json({
      message: 'Exercise created successfully',
      exercise
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update exercise
// @route   PUT /admin/exercises/:id
// @access  Private (Admin)
const updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    const updatedExercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Exercise updated successfully',
      exercise: updatedExercise
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete exercise
// @route   DELETE /admin/exercises/:id
// @access  Private (Admin)
const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    await Exercise.findByIdAndDelete(req.params.id);

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get exercise statistics
// @route   GET /admin/exercises/stats/overview
// @access  Private (Admin)
const getExerciseStats = async (req, res) => {
  try {
    const totalExercises = await Exercise.countDocuments();
    
    const categoryStats = await Exercise.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const muscleGroupStats = await Exercise.aggregate([
      { $unwind: '$primaryMuscles' },
      {
        $group: {
          _id: '$primaryMuscles',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      totalExercises,
      categoryDistribution: categoryStats,
      muscleGroupDistribution: muscleGroupStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
  getExerciseStats
};
