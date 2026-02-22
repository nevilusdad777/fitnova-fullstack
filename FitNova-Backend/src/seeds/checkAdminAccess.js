
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

const checkAdmin = async () => {
  try {
    console.log('1. Attempting Login as Admin...');
    const loginRes = await axios.post(`${API_URL}/users/auth`, {
      email: 'admin@fitnova.com',
      password: 'password123'
    });

    if (loginRes.status === 200) {
      console.log('✅ Login Successful!');
      const token = loginRes.data.token;
      console.log('   Token received.');

      console.log('2. Accessing Protected Admin Route (/admin/stats)...');
      try {
        const statsRes = await axios.get(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Admin Access Successful! Status: ${statsRes.status}`);
        console.log('   Data:', statsRes.data);
      } catch (err) {
        console.log('❌ Admin Access FAILED.');
        if (err.response) {
            console.log(`   Status: ${err.response.status}`);
            console.log(`   Message:`, err.response.data);
        } else {
            console.log(err.message);
        }
      }

    }
  } catch (error) {
    console.log('❌ Login Failed.');
    if (error.response) {
       console.log(`   Status: ${error.response.status}`);
       console.log(`   Message:`, error.response.data);
    } else {
       console.log(error.message);
    }
  }
};

checkAdmin();
