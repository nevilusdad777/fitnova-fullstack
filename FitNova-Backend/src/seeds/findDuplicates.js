const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Exercise = require('../models/Exercise');

async function findDuplicates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Aggregate to find gifUrls used by more than 1 exercise
    const duplicates = await Exercise.aggregate([
      {
        $group: {
          _id: "$gifUrl",
          exercises: { $push: "$name" },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      },
      {
          $sort: { count: -1 }
      }
    ]);

    console.log(`Found ${duplicates.length} shared images.\n`);

    for (let dup of duplicates) {
        if (!dup._id || dup._id.includes('placehold.co')) continue; // Ignore true placeholders if any
        console.log(`URL: ${dup._id}`);
        console.log(`Shared by (${dup.count}): ${dup.exercises.join(', ')}\n`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
     mongoose.disconnect();
  }
}

findDuplicates();
