const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({});
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create new admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt); // Default password: admin123

        const adminUser = new User({
            username: 'admin',
            password: hashedPassword,
            isAdmin: true
        });

        await adminUser.save();
        console.log('Admin user created successfully');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Please change the password after first login');

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createAdminUser(); 