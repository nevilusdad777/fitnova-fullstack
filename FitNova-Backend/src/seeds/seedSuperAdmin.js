require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const superAdminEmail = 'superadmin@fitnova.com';
    let superAdmin = await Admin.findOne({ email: superAdminEmail });

    if (superAdmin) {
      console.log('✓ Superadmin already exists');
      console.log(`  Email: ${superAdmin.email}`);
      console.log(`  Role: ${superAdmin.role}`);
    } else {
      console.log('Creating superadmin account...');
      superAdmin = await Admin.create({
        name: 'Super Admin',
        email: superAdminEmail,
        password: 'admin123',
        role: 'superadmin'
      });
      console.log('✓ Superadmin account created successfully!');
      console.log(`  Email: ${superAdminEmail}`);
      console.log(`  Password: admin123`);
      console.log(`  Role: ${superAdmin.role}`);
    }

    // Also create a regular admin
    const adminEmail = 'admin@fitnova.com';
    let admin = await Admin.findOne({ email: adminEmail });

    if (admin) {
      console.log('✓ Regular admin already exists');
      console.log(`  Email: ${admin.email}`);
      console.log(`  Role: ${admin.role}`);
    } else {
      console.log('Creating regular admin account...');
      admin = await Admin.create({
        name: 'Admin User',
        email: adminEmail,
        password: 'admin123',
        role: 'admin'
      });
      console.log('✓ Regular admin account created successfully!');
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Password: admin123`);
      console.log(`  Role: ${admin.role}`);
    }

    console.log('\n=== Admin Login Credentials ===');
    console.log('Superadmin:');
    console.log('  Email: superadmin@fitnova.com');
    console.log('  Password: admin123');
    console.log('\nRegular Admin:');
    console.log('  Email: admin@fitnova.com');
    console.log('  Password: admin123');

    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
