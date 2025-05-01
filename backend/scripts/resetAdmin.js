const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function resetAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Delete all existing users
        await User.deleteMany({});
        console.log('Deleted all existing users');

        // Create new admin user with exact credentials
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const adminUser = new User({
            username: 'admin',
            password: hashedPassword,
            isAdmin: true
        });

        await adminUser.save();
        console.log('New admin user created successfully');
        console.log('Username: admin');
        console.log('Password: admin123');

    } catch (error) {
        console.error('Error resetting admin user:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

resetAdminUser(); 