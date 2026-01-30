const WorkoutPlan = require('../models/WorkoutPlan');
const Exercise = require('../models/Exercise');

const WORKOUT_TEMPLATES = require('../utils/workoutTemplates');

const generatePlan = async (req, res) => {
    try {
        const { splitType, fitnessLevel = 'intermediate' } = req.body;

        if (!splitType || !WORKOUT_TEMPLATES[splitType]) {
            return res.status(400).json({ message: 'Invalid or unsupported split type' });
        }

        const templateGroup = WORKOUT_TEMPLATES[splitType];
        
        // Default to intermediate if level not found
        const safeFitnessLevel = templateGroup.levels[fitnessLevel] ? fitnessLevel : 'intermediate';
        const selectedSchedule = templateGroup.levels[safeFitnessLevel];

        if (!selectedSchedule) {
             return res.status(400).json({ message: 'Plan not available for this level' });
        }

        const schedule = [];

        // For each day in the template, find the exercises in the DB
        for (const day of selectedSchedule) {
            let dayExercises = [];
            
            if (day.exercises && day.exercises.length > 0) {
                // Find these specific exercises in the DB
                const exercises = await Exercise.find({
                    name: { $in: day.exercises } 
                });

                // Map DB results to the order in the template
                day.exercises.forEach(templateExName => {
                    // Fuzzy match attempt if exact match fails
                    const foundEx = exercises.find(e => e.name.toLowerCase() === templateExName.toLowerCase()) ||
                                    exercises.find(e => e.name.toLowerCase().includes(templateExName.toLowerCase()));
                                    
                    if (foundEx) {
                         // Avoid duplicates in the same day if fuzzy match picks same one
                         if (!dayExercises.some(ex => ex.exerciseId.toString() === foundEx._id.toString())) {
                            dayExercises.push({
                                exerciseId: foundEx._id,
                                name: foundEx.name, // Use DB name or template name? DB name is safer
                                sets: foundEx.defaultSets,
                                reps: foundEx.defaultReps ? `${foundEx.defaultReps}` : "10-12",
                                restSeconds: foundEx.name.toLowerCase().includes('barbell') ? 90 : 60,
                                notes: ''
                            });
                         }
                    }
                });
            }

            schedule.push({
                dayOfWeek: day.dayOfWeek,
                name: day.name,
                exercises: dayExercises
            });
        }

        const activeDays = selectedSchedule.map(d => d.dayOfWeek);

        const planData = {
            user: req.user._id,
            name: `${templateGroup.name} (${safeFitnessLevel.charAt(0).toUpperCase() + safeFitnessLevel.slice(1)})`,
            splitType,
            fitnessLevel: safeFitnessLevel,
            schedule,
            activeDays,
            isActive: false,
            totalDaysPerWeek: templateGroup.daysPerWeek
        };

        res.json(planData);
    } catch (error) {
        console.error('Plan Generation Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const savePlan = async (req, res) => {
    try {
        const planData = req.body;
        planData.user = req.user._id;

        // Deactivate other plans
        await WorkoutPlan.updateMany(
            { user: req.user._id, isActive: true },
            { isActive: false }
        );

        const plan = await WorkoutPlan.create(planData);
        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getActivePlan = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findOne({
            user: req.user._id,
            isActive: true
        }).populate('schedule.exercises.exerciseId');

        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePlan = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        if (plan.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        Object.assign(plan, req.body);
        await plan.save();

        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deletePlan = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        if (plan.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await plan.deleteOne();
        res.json({ message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    generatePlan,
    savePlan,
    getActivePlan,
    updatePlan,
    deletePlan
};
