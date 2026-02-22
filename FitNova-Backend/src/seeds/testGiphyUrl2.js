const axios = require('axios');
const fs = require('fs');

async function testGiphyUrl() {
    const urls = [
        'https://media.tenor.com/FwI4U1k3z0AAAAAM/burpee-exercise.gif',
        'https://media1.giphy.com/media/23hPPMRgPbfFSzwvdT/giphy.gif'
    ];

    let out = [];
    for (let u of urls) {
        try {
            await axios.head(u);
            out.push(`SUCCESS: ${u}`);
        } catch (e) {
            out.push(`FAIL: ${u} - ${e.message}`);
        }
    }
    fs.writeFileSync('url-results.json', JSON.stringify(out, null, 2));
}

testGiphyUrl();
