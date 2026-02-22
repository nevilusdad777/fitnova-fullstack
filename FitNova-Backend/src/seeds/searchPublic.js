const axios = require('axios');

async function searchPublic() {
    const response = await axios.get('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
    const sourceData = response.data;
    const terms = ['knees', 'treadmill', 'walk', 'march', 'versa', 'bike', 'cycle', 'jump', 'rope', 'sprint', 'stair', 'climb'];
    
    let res = {};
    for (let term of terms) {
        res[term] = sourceData.filter(ex => ex.name.toLowerCase().includes(term)).map(e => e.name);
    }
    
    console.log(JSON.stringify(res, null, 2));
}

searchPublic();
