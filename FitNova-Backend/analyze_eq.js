const fs = require('fs');
const data = JSON.parse(fs.readFileSync('temp_exercises.json', 'utf8'));
const eqs = new Set();
data.forEach(e => eqs.add(e.equipment));
console.log('Equipment:', Array.from(eqs));
