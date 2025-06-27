require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function updateUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find and update the user
        const user = await User.findOneAndUpdate(
            { email: 'rishiknarayana1@gmail.com' },
            { 
                firstName: 'Rishik',
                lastName: 'Narayana'
            },
            { new: true }
        );

        if (user) {
            console.log('User updated successfully:', user);
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

updateUser(); 