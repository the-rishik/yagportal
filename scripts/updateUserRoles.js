const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/njyag', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function updateUserRoles() {
    try {
        console.log('Starting user role update...');
        
        // Find all users with role 'user' and update them to 'Student'
        const result = await User.updateMany(
            { role: 'user' },
            { role: 'Student' }
        );
        
        console.log(`Updated ${result.modifiedCount} users from 'user' to 'Student' role`);
        
        // Verify the update
        const userCount = await User.countDocuments({ role: 'Student' });
        const oldUserCount = await User.countDocuments({ role: 'user' });
        
        console.log(`Current users with 'Student' role: ${userCount}`);
        console.log(`Current users with 'user' role: ${oldUserCount}`);
        
        console.log('User role update completed successfully!');
        
    } catch (error) {
        console.error('Error updating user roles:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the update
updateUserRoles(); 