
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const verifyAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Define minimal User schema
    const UserSchema = new mongoose.Schema({
      name: String,
      email: String,
      role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
      }
    });

    const User = mongoose.model('User', UserSchema);

    const admin = await User.findOne({ email: 'admin@fitnova.com' });

    if (!admin) {
      console.log('❌ Admin user NOT found in database.');
    } else {
      console.log('✅ Admin user found:');
      console.log(`   ID: ${admin._id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: '${admin.role}'`);
      
      if (admin.role !== 'admin') {
         console.log('⚠️ WARNING: Role is NOT admin!');
      } else {
         console.log('✅ Role is correct.');
      }
    }

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

verifyAdmin();
