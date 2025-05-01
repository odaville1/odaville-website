const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function deleteAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Delete all users (since we only have admin)
        const result = await User.deleteMany({});
        console.log(`Deleted ${result.deletedCount} user(s)`);

    } catch (error) {
        console.error('Error deleting admin user:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

deleteAdminUser(); 