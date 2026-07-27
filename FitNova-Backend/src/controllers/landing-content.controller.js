const LandingContent = require('../models/LandingContent');

// Default content that seeds on first request if DB is empty
const defaultContent = {
  hero: {
    badgeText: 'Your Fitness Revolution Starts Here',
    title: 'Unleash Your Strength',
    description: 'Transform your body and mind with FitNova - the ultimate fitness companion that tracks workouts, optimizes nutrition, and drives real results with AI-powered insights.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    ctaText: 'Start Your Journey'
  },
  stats: [
    { value: '100% Free', label: 'No Premium Paywalls' },
    { value: 'No Ads', label: 'Pure Fitness Experience' },
    { value: 'Smart System', label: 'Personalized Insights' },
    { value: 'Secure', label: 'Your Data is Private' }
  ],
  features: [
    {
      title: 'Workout Tracking',
      description: 'Track every rep, set, and exercise with precision. Monitor your performance across different muscle groups and visualize your strength gains over time.',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
      iconName: 'Activity',
      iconBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      points: ['Log exercises with sets and reps', 'Track body part workouts', 'View detailed workout history', 'Monitor calories burned']
    },
    {
      title: 'Nutrition Planning',
      description: 'Plan your meals with our extensive food database. Track calories, macros, and nutrients to fuel your body optimally for your fitness goals.',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
      iconName: 'Apple',
      iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      points: ['Extensive food database', 'Track calories and macros', 'Weekly meal planning', 'Daily nutrition monitoring']
    },
    {
      title: 'Progress Analytics',
      description: 'Visualize your fitness journey with interactive charts. Track weight changes, workout consistency, and identify patterns to optimize your training.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
      iconName: 'BarChart3',
      iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      points: ['Interactive progress charts', 'Weight tracking over time', 'Consistency metrics', 'Performance analysis']
    },
    {
      title: 'Health Monitoring',
      description: 'Monitor your overall health metrics including water intake, sleep quality, and body measurements to ensure holistic wellness.',
      image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80',
      iconName: 'Heart',
      iconBg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      points: ['Track water intake daily', 'Monitor body measurements', 'Track Calories Intake And Burnt', 'Overall wellness score']
    },
    {
      title: 'Seamless Web Access',
      description: 'Connect directly with our comprehensive web platform. Access your workouts, nutrition plans, and progress from any device, anywhere.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      iconName: 'Zap',
      iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      points: ['Access from any device', 'Real-time data synchronization', 'Comprehensive dashboard', 'No installation required']
    },
    {
      title: 'Achievement System',
      description: 'Stay motivated with our achievement and streak system. Celebrate milestones and maintain consistency with gamified tracking.',
      image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
      iconName: 'Trophy',
      iconBg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      points: ['Earn achievements', 'Build workout streaks', 'Track milestones', 'Unlock badges']
    }
  ],
  testimonials: [
    {
      text: 'FitNova completely transformed how I approach fitness. The analytics helped me understand my progress and stay motivated!',
      name: 'Sarah Johnson',
      role: 'Fitness Enthusiast',
      initials: 'SJ',
      rating: 5
    },
    {
      text: "The workout tracking is incredibly detailed and the nutrition planning feature is a game-changer. I've lost 15 pounds in 3 months!",
      name: 'Michael Chen',
      role: 'Weight Loss Journey',
      initials: 'MC',
      rating: 5
    },
    {
      text: "As a personal trainer, I recommend FitNova to all my clients. It's the most comprehensive fitness app I've ever used.",
      name: 'Emma Davis',
      role: 'Personal Trainer',
      initials: 'ED',
      rating: 5
    }
  ]
};

/**
 * GET /landing-content — public, no auth
 */
const getLandingContent = async (req, res) => {
  try {
    let content = await LandingContent.findOne();

    if (!content) {
      // Auto-seed on first call
      content = await LandingContent.create(defaultContent);
    }

    res.json(content);
  } catch (error) {
    console.error('getLandingContent error:', error);
    res.status(500).json({ message: 'Failed to fetch landing content' });
  }
};

/**
 * PUT /admin/landing-content — admin protected
 * Accepts partial updates: only provided fields are merged
 */
const updateLandingContent = async (req, res) => {
  try {
    let content = await LandingContent.findOne();

    if (!content) {
      content = await LandingContent.create(defaultContent);
    }

    const { hero, stats, features, testimonials } = req.body;

    if (hero !== undefined) content.hero = { ...content.hero.toObject(), ...hero };
    if (stats !== undefined) content.stats = stats;
    if (features !== undefined) content.features = features;
    if (testimonials !== undefined) content.testimonials = testimonials;

    await content.save();

    res.json({ message: 'Landing content updated successfully', content });
  } catch (error) {
    console.error('updateLandingContent error:', error);
    res.status(500).json({ message: 'Failed to update landing content' });
  }
};

module.exports = { getLandingContent, updateLandingContent };
