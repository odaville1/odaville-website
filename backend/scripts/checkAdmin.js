const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function checkAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Find admin user
        const adminUser = await User.findOne({ username: 'admin' });
        if (adminUser) {
            console.log('Admin user exists:');
            console.log('Username:', adminUser.username);
            console.log('isAdmin:', adminUser.isAdmin);
            console.log('Created at:', adminUser.createdAt);
        } else {
            console.log('No admin user found in database');
        }

    } catch (error) {
        console.error('Error checking admin user:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkAdminUser(); 