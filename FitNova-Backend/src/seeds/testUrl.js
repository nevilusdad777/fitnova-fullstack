const axios = require('axios');

async function testUrl() {
    const urls = [
        'https://raw.githubusercontent.com/austinstandard/fitness-api/master/assets/exercises/burpee.gif',
        'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Burpee/0.jpg',
        'https://raw.githubusercontent.com/vinhnx/exercises-db/master/dist/exercises/burpee.gif',
        'https://fitnessprogramer.com/wp-content/uploads/2021/02/Burpee.gif',
        'https://gymvisual.com/img/p/4/2/4/6/4246.gif'
    ];

    for (let u of urls) {
        try {
            console.log(`Testing ${u}...`);
            await axios.head(u);
            console.log(`\u2705 SUCCESS: ${u}`);
        } catch (e) {
            console.log(`\u274C FAIL: ${u} - ${e.message}`);
        }
    }
}

testUrl();
