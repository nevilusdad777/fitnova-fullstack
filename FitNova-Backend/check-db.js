require('dotenv').config();
const mongoose = require('mongoose');
const Tracker = require('./src/models/Tracker');
const WorkoutHistory = require('./src/models/WorkoutHistory');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitnova').then(async () => {
    try {
        const t = await Tracker.find({date: {$in: ['2026-02-27', '2026-02-28']}});
        const w = await WorkoutHistory.find({
            date: {
                $gte: new Date('2026-02-27T00:00:00Z'),
                $lt: new Date('2026-03-01T00:00:00Z')
            }
        });
        console.log('--- TRACKERS ---');
        console.log(t.map(x=>x.date));
        console.log('--- WORKOUTS ---');
        console.log(w.map(x=>x.date.toISOString()));
    } catch(err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
});
