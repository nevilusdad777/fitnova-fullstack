const mongoose = require('mongoose');
require('dotenv').config();
const Exercise = require('../models/Exercise');

// Load both parts of the exercise data
const part1 = require('./data/exercises_part1.js'); // chest, back, biceps, shoulders
const part2 = require('./data/exercises_part2.js'); // triceps, legs, abs, cardio

const allExercises = [...part1, ...part2];

const seedBigExerciseLibrary = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing exercises
        await Exercise.deleteMany({});
        console.log('🗑️  Existing exercises cleared\n');

        // Insert all exercises (ordered:false to skip any accidental duplicates)
        const result = await Exercise.insertMany(allExercises, { ordered: false });
        console.log(`🎉 Successfully inserted ${result.length} exercises!\n`);

        // ── Summary breakdown ──────────────────────────────────────────────────
        const bodyPartMap = {};
        const diffMap = {};

        allExercises.forEach(ex => {
            // by bodyPart
            if (!bodyPartMap[ex.bodyPart]) bodyPartMap[ex.bodyPart] = { beginner: 0, intermediate: 0, advanced: 0 };
            bodyPartMap[ex.bodyPart][ex.difficulty]++;

            // by difficulty overall
            diffMap[ex.difficulty] = (diffMap[ex.difficulty] || 0) + 1;
        });

        console.log('📊 Exercise Breakdown by Muscle Group & Difficulty:');
        console.log('─'.repeat(56));
        const order = ['chest', 'back', 'biceps', 'shoulders', 'triceps', 'legs', 'abs', 'cardio'];
        order.forEach(part => {
            const data = bodyPartMap[part] || {};
            const total = (data.beginner || 0) + (data.intermediate || 0) + (data.advanced || 0);
            console.log(
                `  ${part.padEnd(12)} | Beginner: ${String(data.beginner || 0).padEnd(3)} | Intermediate: ${String(data.intermediate || 0).padEnd(3)} | Advanced: ${String(data.advanced || 0).padEnd(3)} | Total: ${total}`
            );
        });

        console.log('─'.repeat(56));
        console.log(`  Overall  | Beginner: ${diffMap.beginner || 0}   Intermediate: ${diffMap.intermediate || 0}   Advanced: ${diffMap.advanced || 0}`);
        console.log(`\n  GRAND TOTAL: ${result.length} exercises in the library 🏋️\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding exercises:', error);
        process.exit(1);
    }
};

seedBigExerciseLibrary();
