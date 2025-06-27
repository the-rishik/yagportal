const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function makeUserAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find and update the user
        const user = await User.findOneAndUpdate(
            { email: 'rishiknarayana@gmail.com' },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log('Successfully made user admin:', {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            });
        } else {
            console.log('User not found');
        }
    } catch (error) {
        console.error('Error updating user:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

makeUserAdmin(); 