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
    const { category, isVegetarian, apiSource } = req.query;
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (isVegetarian !== undefined) {
      filter.isVegetarian = isVegetarian === 'true';
    }

    if (apiSource) {
      filter.apiSource = apiSource;
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

// Update custom food (only the creator can update, and only user-created foods)
exports.updateFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    // Only allow editing user-created foods
    if (food.apiSource !== 'user') {
      return res.status(403).json({ success: false, message: 'You can only edit custom foods you created' });
    }

    // Only the creator can edit
    if (food.createdBy && food.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this food' });
    }

    const allowedFields = ['name', 'category', 'description', 'isVegetarian', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'servingSize', 'servingUnit'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updated = await Food.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

    res.json({ success: true, message: 'Food updated successfully', data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating food', error: error.message });
  }
};

// Delete custom food (only the creator can delete, and only user-created foods)
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    if (food.apiSource !== 'user') {
      return res.status(403).json({ success: false, message: 'You can only delete custom foods you created' });
    }

    if (food.createdBy && food.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this food' });
    }

    await Food.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Food deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting food', error: error.message });
  }
};

