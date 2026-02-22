const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Exercise = require('../models/Exercise');

async function setBurpeeImageFromUrl() {
    try {
        const articleUrl = 'https://www.muscleandfitness.com/workouts/full-body-exercises/how-do-burpees-perfect-form/';
        console.log(`Fetching ${articleUrl}...`);
        const response = await axios.get(articleUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' // to prevent basic blocking
            }
        });
        const html = response.data;
        
        // Extract og:image
        const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
        let imageUrl = '';
        if (ogImageMatch && ogImageMatch[1]) {
            imageUrl = ogImageMatch[1];
        } else {
            // fallback generic img tag search if og:image fails
            const imgMatch = html.match(/<img[^>]+src="([^">]+\.(jpg|jpeg|png|gif))"/i);
            if (imgMatch && imgMatch[1]) {
                 imageUrl = imgMatch[1];
            } else {
                 console.log("Could not find a suitable image in the HTML.");
                 return;
            }
        }

        console.log(`Found image URL: ${imageUrl}`);
        
        await mongoose.connect(process.env.MONGODB_URI);
        const ex = await Exercise.findOne({ name: 'Burpees' });
        if (ex) {
            ex.images = [imageUrl];
            ex.gifUrl = imageUrl;
            await ex.save();
            console.log('Successfully updated Burpees to use the user-requested image!');
        } else {
            console.log('Burpees exercise not found in DB.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (mongoose.connection.readyState === 1) {
            mongoose.disconnect();
        }
    }
}
setBurpeeImageFromUrl();
