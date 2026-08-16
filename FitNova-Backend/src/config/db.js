const mongoose = require('mongoose');

let cachedConn = null;

const connectDB = async () => {
  if (cachedConn && mongoose.connection.readyState >= 1) {
    return cachedConn;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    cachedConn = await mongoose.connect(process.env.MONGODB_URI, { family: 4 });

    console.log(`MongoDB Connected: ${cachedConn.connection.host}`);
    return cachedConn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

module.exports = connectDB;

