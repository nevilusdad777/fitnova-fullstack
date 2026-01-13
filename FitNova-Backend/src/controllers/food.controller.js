const Food = require('../models/Food');

// Search foods by name or category
exports.searchFoods = async (req, res) => {
  try {
    const { query, category, isVegetarian } = req.query;
    let searchCriteria = {};

    if (query) {
      searchCriteria.$text = { $search: query };
    }

    if (category) {
      searchCriteria.category = category;
    }

    if (isVegetarian !== undefined) {
      searchCriteria.isVegetarian = isVegetarian === 'true';
    }

    const foods = await Food.find(searchCriteria)
      .limit(50)
      .sort({ verified: -1, name: 1 });

    res.json({
      success: true,
      count: foods.length,
      data: foods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching foods',
      error: error.message
    });
  }
};

// Get all foods with optional category filter
exports.getAllFoods = async (req, res) => {
  try {
    const { category, isVegetarian } = req.query;
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (isVegetarian !== undefined) {
      filter.isVegetarian = isVegetarian === 'true';
    }

    const foods = await Food.find(filter)
      .sort({ name: 1 });

    res.json({
      success: true,
      count: foods.length,
      data: foods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching foods',
      error: error.message
    });
  }
};

// Get food by ID
exports.getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found'
      });
    }

    res.json({
      success: true,
      data: food
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching food',
      error: error.message
    });
  }
};

// Create custom food
exports.createFood = async (req, res) => {
  try {
    const foodData = {
      ...req.body,
      createdBy: req.user?._id,
      apiSource: 'user',
      verified: false
    };

    const food = await Food.create(foodData);

    res.status(201).json({
      success: true,
      message: 'Food created successfully',
      data: food
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating food',
      error: error.message
    });
  }
};

// Get food categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Food.distinct('category');

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// Get popular foods (verified foods)
exports.getPopularFoods = async (req, res) => {
  try {
    const foods = await Food.find({ verified: true })
      .limit(20)
      .sort({ name: 1 });

    res.json({
      success: true,
      count: foods.length,
      data: foods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching popular foods',
      error: error.message
    });
  }
};
