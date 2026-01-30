const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  age: {
    type: Number,
    required: true,
    min: 10,
    max: 120
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  height: {
    type: Number,
    required: true,
    min: 50,
    max: 300
  },
  weight: {
    type: Number,
    required: true,
    min: 20,
    max: 500
  },
  goal: {
    type: String,
    required: true,
    enum: ['gain', 'loss', 'maintain']
  },
  activityLevel: {
    type: Number,
    required: true,
    min: 1.2,
    max: 1.9
  },
  preferences: {
    weightUnit: {
      type: String,
      default: 'kg',
      enum: ['kg', 'lbs']
    },
    waterUnit: {
      type: String,
      default: 'ml',
      enum: ['ml', 'oz']
    }
  },
  bmr: {
    type: Number,
    required: true
  },
  tdee: {
    type: Number,
    required: true
  },
  dailyCalorieTarget: {
    type: Number,
    required: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  waterGoal: {
    type: Number,
    default: 3000
  },
  totalWorkoutsCompleted: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);