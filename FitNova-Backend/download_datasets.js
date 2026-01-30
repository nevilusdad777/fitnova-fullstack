const https = require('https');
const fs = require('fs');

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
};

const run = async () => {
    try {
        console.log('Downloading wrkout...');
        await download('https://raw.githubusercontent.com/wrkout/exercises.json/master/exercises.json', 'wrkout.json');
        
        console.log('Downloads complete.');
    } catch (e) {
        console.error(e);
    }
};

run();
