const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Exercise = require('../models/Exercise');
const fs = require('fs');

async function findDuplicates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
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

    let output = [];
    for (let dup of duplicates) {
        if (!dup._id || dup._id.includes('placehold.co')) continue;
        output.push({ url: dup._id, exercises: dup.exercises });
    }
    
    fs.writeFileSync('duplicates.json', JSON.stringify(output, null, 2));
    console.log('Saved to duplicates.json');

  } catch (error) {
    console.error('Error:', error);
  } finally {
     mongoose.disconnect();
  }
}

findDuplicates();
