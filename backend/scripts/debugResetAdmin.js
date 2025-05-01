const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function debugResetAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Delete all existing users
        const deleteResult = await User.deleteMany({});
        console.log('Deleted users:', deleteResult);

        // Create new admin user with exact credentials
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const adminUser = new User({
            username: 'admin',
            password: hashedPassword,
            isAdmin: true
        });

        const savedUser = await adminUser.save();
        console.log('New admin user created:', {
            id: savedUser._id,
            username: savedUser.username,
            isAdmin: savedUser.isAdmin
        });

        // Verify the password works
        const verifyUser = await User.findOne({ username: 'admin' });
        const passwordMatch = await verifyUser.comparePassword('admin123');
        console.log('Password verification:', passwordMatch);

    } catch (error) {
        console.error('Error in debug reset:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

debugResetAdmin(); 