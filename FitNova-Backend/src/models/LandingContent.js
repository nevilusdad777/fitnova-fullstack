const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true }
}, { _id: false });

const featureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  iconName: { type: String, default: 'Activity' },
  iconBg: { type: String, default: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
  points: [{ type: String }]
});

const testimonialSchema = new mongoose.Schema({
  text: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: '' },
  initials: { type: String, default: '' },
  rating: { type: Number, default: 5, min: 1, max: 5 }
});

const heroSchema = new mongoose.Schema({
  badgeText: { type: String, default: 'Your Fitness Revolution Starts Here' },
  title: { type: String, default: 'Unleash Your Strength' },
  description: { type: String, default: 'Transform your body and mind with FitNova - the ultimate fitness companion that tracks workouts, optimizes nutrition, and drives real results.' },
  image: { type: String, default: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' },
  ctaText: { type: String, default: 'Start Your Journey' }
}, { _id: false });

const landingContentSchema = new mongoose.Schema({
  hero: { type: heroSchema, default: () => ({}) },
  stats: { type: [statSchema], default: [] },
  features: { type: [featureSchema], default: [] },
  testimonials: { type: [testimonialSchema], default: [] }
}, { timestamps: true });

// Singleton document — there can only be one
const LandingContent = mongoose.model('LandingContent', landingContentSchema);

module.exports = LandingContent;
