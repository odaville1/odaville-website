const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdminFinal() {
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

        // Create password hash directly
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin user document directly
        const result = await User.collection.insertOne({
            username: 'admin',
            password: hashedPassword,
            isAdmin: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('Admin user created successfully');
        console.log('Username: admin');
        console.log('Password: admin123');

        // Verify the user was created
        const user = await User.findOne({ username: 'admin' });
        if (user) {
            // Test password verification
            const isMatch = await bcrypt.compare(password, user.password);
            console.log('Password verification test:', isMatch);
        }

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createAdminFinal(); 