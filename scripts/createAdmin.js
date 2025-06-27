const mongoose = require('mongoose');
const User = require('../models/User');

// MongoDB Connection
const MONGODB_URI = 'mongodb://localhost:27017/njyag';

async function createAdminUser() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@njyag.com' });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@njyag.com');
            console.log('Password: admin123');
            console.log('Role:', existingAdmin.role);
            return;
        }

        // Create admin user
        const adminUser = new User({
            email: 'admin@njyag.com',
            password: 'admin123',
            firstName: 'Admin',
            lastName: 'User',
            school: 'NJ YAG',
            role: 'admin'
        });

        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log('Email: admin@njyag.com');
        console.log('Password: admin123');
        console.log('Role: admin');

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createAdminUser(); 