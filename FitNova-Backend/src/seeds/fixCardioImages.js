const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Exercise = require('../models/Exercise');

async function fixCardioImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Exact Yuhonas paths
    const map = {
        "High Knees": "Knee_Tuck_Jump", // Closest high knee action
        "Brisk Treadmill Walk": "Walking_Treadmill",
        "Marching in Place": "Jogging_Treadmill", // Closest
        "Versa Climber": "Mountain_Climbers", // Closest climber
        "Stationary Bike": "Recumbent_Bike",
        "Assault Bike Sprints": "Air_Bike",
        "Jumping Jacks": "Star_Jump",
        "Jump Rope (Basic)": "Rope_Jumping",
        "Jump Rope Double Unders": "Rope_Jumping",
        "Sprint Intervals": "Wind_Sprints",
        "Stair Sprints": "Power_Stairs",
        "Chest Dips": "Dips_-_Chest_Version",
        "Weighted Chest Dips": "Dips_-_Chest_Version", // Okay to share
        "Cable Lateral Raise": "Cable_Seated_Lateral_Raise",
        "Egyptian Lateral Raise": "Cable_Seated_Lateral_Raise",
        "Barbell Curl": "Barbell_Curl",
        "21s Barbell Curl": "Barbell_Curl",
        "Cable Crunch": "Cable_Crunch",
        "Weighted Cable Crunch": "Cable_Crunch",
        "Face Pull": "Face_Pull",
        "Cable Pull Through": "Pull_Through"
    };

    const baseUrl = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';
    let count = 0;

    for (let exName in map) {
        let ex = await Exercise.findOne({ name: exName });
        if (ex) {
            const folderName = map[exName];
            ex.images = [`${baseUrl}/${folderName}/0.jpg`, `${baseUrl}/${folderName}/1.jpg`];
            ex.gifUrl = ex.images[0];
            await ex.save();
            count++;
            console.log(`Updated ${exName} -> ${folderName}`);
        }
    }
    
    console.log(`Successfully updated ${count} exercises to specific images.`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
     mongoose.disconnect();
  }
}

fixCardioImages();
