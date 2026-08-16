require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const trackerRoutes = require('./routes/tracker.routes');
const workoutRoutes = require('./routes/workout.routes');
const dietRoutes = require('./routes/diet.routes');
const routineRoutes = require('./routes/routine.routes');
const workoutHistoryRoutes = require('./routes/workout-history.routes');
const workoutPlanRoutes = require('./routes/workout-plan.routes');
const landingContentRoutes = require('./routes/landing-content.routes');
const adminLandingContentRoutes = require('./routes/admin-landing-content.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for profile pictures
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'FitNova API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});


// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/tracker', trackerRoutes);
app.use('/workout', workoutRoutes);
app.use('/exercises', require('./routes/exercise.routes'));
app.use('/food', require('./routes/food.routes'));
app.use('/diet', dietRoutes);
app.use('/routines', routineRoutes);
app.use('/workout-history', workoutHistoryRoutes);
app.use('/workout-plan', workoutPlanRoutes);
app.use('/landing-content', landingContentRoutes);

// Admin routes
app.use('/admin/auth', require('./routes/admin-auth.routes'));
app.use('/admin/users', require('./routes/admin-user.routes'));
app.use('/admin/foods', require('./routes/admin-food.routes'));
app.use('/admin/exercises', require('./routes/admin-exercise.routes'));
app.use('/admin/stats', require('./routes/admin-stats.routes'));
app.use('/admin/landing-content', adminLandingContentRoutes);
app.use('/admin', require('./routes/admin.routes'));

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
