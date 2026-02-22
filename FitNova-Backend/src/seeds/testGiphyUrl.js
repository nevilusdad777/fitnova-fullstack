const axios = require('axios');

async function testGiphyUrl() {
    const urls = [
        'https://media.giphy.com/media/23hPPMRgPbfFSzwvdT/giphy.gif',
        'https://media.tenor.com/images/40964177cbb6ce20f6667dcf49c30cdd/tenor.gif',
        'https://media.tenor.com/FwI4U1k3z0AAAAAM/burpee-exercise.gif',
        'https://workoutlabs.com/wp-content/uploads/watermarked/Burpees_1.png'
    ];

    for (let u of urls) {
        try {
            console.log(`Testing ${u}...`);
            await axios.head(u);
            console.log(`\u2705 SUCCESS: ${u}`);
        } catch (e) {
            console.log(`\u274C FAIL: ${u}`);
        }
    }
}

testGiphyUrl();
