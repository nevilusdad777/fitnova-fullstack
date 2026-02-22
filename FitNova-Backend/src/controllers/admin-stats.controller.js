const User = require('../models/User');
const Food = require('../models/Food');
const Exercise = require('../models/Exercise');
const WorkoutPlan = require('../models/WorkoutPlan');
const Diet = require('../models/Diet');

// @desc    Get dashboard statistics
// @route   GET /admin/stats/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalFoods = await Food.countDocuments();
    const totalExercises = await Exercise.countDocuments();
    const totalWorkoutPlans = await WorkoutPlan.countDocuments();
    const totalDietPlans = await Diet.countDocuments();

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({
      role: { $ne: 'admin' },
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get user goal distribution
    const goalDistribution = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      {
        $group: {
          _id: '$goal',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get gender distribution
    const genderDistribution = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent registrations (last 30 days, limit 10)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.find({
      role: { $ne: 'admin' },
      createdAt: { $gte: thirtyDaysAgo }
    })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      overview: {
        totalUsers,
        totalFoods,
        totalExercises,
        totalWorkoutPlans,
        totalDietPlans,
        recentUsers
      },
      userStats: {
        goalDistribution: goalDistribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        genderDistribution: genderDistribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      recentActivity: {
        registrations: recentRegistrations
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user growth statistics
// @route   GET /admin/stats/users/growth
// @access  Private (Admin)
const getUserGrowth = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await User.aggregate([
      {
        $match: {
          role: { $ne: 'admin' },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      period: 'last30Days',
      data: userGrowth
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getUserGrowth
};
