const fs = require('fs');

const data = JSON.parse(fs.readFileSync('temp_exercises.json', 'utf8'));

console.log('Total exercises:', data.length);

const categories = new Set();
const levels = new Set();
const muscles = new Set();

data.forEach(ex => {
    if (ex.category) categories.add(ex.category);
    if (ex.level) levels.add(ex.level);
    if (ex.primaryMuscles) ex.primaryMuscles.forEach(m => muscles.add(m));
});

console.log('Categories:', Array.from(categories));
console.log('Levels:', Array.from(levels));
console.log('Muscles:', Array.from(muscles));

if (data.length > 0) {
    console.log('Sample Image:', data[0].images);
}
