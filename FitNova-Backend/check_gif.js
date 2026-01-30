const fs = require('fs');
const https = require('https');

// Check URL
const urls = [
    'https://upload.wikimedia.org/wikipedia/commons/e/e2/Pushup.gif',
    'https://upload.wikimedia.org/wikipedia/commons/8/82/Squats.gif', 
    'https://upload.wikimedia.org/wikipedia/commons/2/25/Jumping_Jacks.gif'
];

urls.forEach(url => {
    const req = https.request(url, { method: 'HEAD' }, (res) => {
        console.log(`URL ${url} status: ${res.statusCode}`);
    });
    req.on('error', (e) => console.error(`Error ${url}:`, e.message));
    req.end();
});
