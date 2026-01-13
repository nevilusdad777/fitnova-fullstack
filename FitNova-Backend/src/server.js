require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const trackerRoutes = require('./routes/tracker.routes');
const workoutRoutes = require('./routes/workout.routes');
const dietRoutes = require('./routes/diet.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'FitNova API is running' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/tracker', trackerRoutes);
app.use('/workout', workoutRoutes);
app.use('/exercises', require('./routes/exercise.routes'));
app.use('/food', require('./routes/food.routes'));
app.use('/diet', dietRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Connect DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});
