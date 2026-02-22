const axios = require('axios');

async function getBurpee() {
    const response = await axios.get('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
    const sourceData = response.data;
    const matches = sourceData.filter(ex => ex.name.toLowerCase().includes('burpee'));
    console.log(JSON.stringify(matches, null, 2));
}

getBurpee();
