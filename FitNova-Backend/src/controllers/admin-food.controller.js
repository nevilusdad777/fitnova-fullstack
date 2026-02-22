const Food = require('../models/Food');

// @desc    Get all foods with pagination
// @route   GET /admin/foods
// @access  Private (Admin)
const getAllFoods = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const sortField = req.query.sortField || 'name';
    const sortDirection = req.query.sortDirection === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    const foods = await Food.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ [sortField]: sortDirection });

    const total = await Food.countDocuments(query);

    res.json({
      foods,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalFoods: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single food by ID
// @route   GET /admin/foods/:id
// @access  Private (Admin)
const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new food
// @route   POST /admin/foods
// @access  Private (Admin)
const createFood = async (req, res) => {
  try {
    const food = await Food.create(req.body);
    res.status(201).json({
      message: 'Food created successfully',
      food
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update food
// @route   PUT /admin/foods/:id
// @access  Private (Admin)
const updateFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    const updatedFood = await Food.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Food updated successfully',
      food: updatedFood
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete food
// @route   DELETE /admin/foods/:id
// @access  Private (Admin)
const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    await Food.findByIdAndDelete(req.params.id);

    res.json({ message: 'Food deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get food statistics
// @route   GET /admin/foods/stats/overview
// @access  Private (Admin)
const getFoodStats = async (req, res) => {
  try {
    const totalFoods = await Food.countDocuments();
    
    const categoryStats = await Food.aggregate([
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

    res.json({
      totalFoods,
      categoryDistribution: categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  getFoodStats
};
