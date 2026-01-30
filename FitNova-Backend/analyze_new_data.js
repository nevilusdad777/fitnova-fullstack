const fs = require('fs');

const analyze = (file) => {
    try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        console.log(`\n--- ${file} ---`);
        console.log('Count:', data.length);
        if (data.length > 0) {
            console.log('Sample:', JSON.stringify(data[0], null, 2));
            
            // Check for gifs
            const hasGif = data.some(d => {
                const img = d.gifUrl || d.image || d.images?.[0] || '';
                return img.includes('.gif');
            });
            console.log('Has GIFs:', hasGif);
        }
    } catch (e) {
        console.log(`Error reading ${file}:`, e.message);
    }
};

analyze('wrkout.json');
