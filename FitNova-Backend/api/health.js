const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
    return res.status(200).json({
      status: 'UP',
      message: 'FitNova API is running',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      status: 'DOWN',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
