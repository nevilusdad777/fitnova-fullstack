require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const adminEmail = 'admin@fitnova.com';
    let admin = await Admin.findOne({ email: adminEmail });

    if (admin) {
        console.log('Admin user found. Updating role to superadmin...');
        admin.role = 'superadmin';
        admin.name = 'Super Admin';
        admin.password = 'password123'; // The pre-save hook will hash it
        await admin.save();
        console.log('Admin role and password updated.');
    } else {
        console.log('Admin user not found. Creating new superadmin...');
        admin = await Admin.create({
            name: 'Super Admin',
            email: adminEmail,
            password: 'password123',
            role: 'superadmin'
        });
        console.log('Super Admin created with password: password123');
    }

    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
