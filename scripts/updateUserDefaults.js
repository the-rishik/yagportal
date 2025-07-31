const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/njyag', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function updateUserDefaults() {
    try {
        console.log('Starting user defaults update...');
        
        // Find all users that don't have emergency contact or t-shirt size set
        const usersToUpdate = await User.find({
            $or: [
                { emergencyContact: { $exists: false } },
                { emergencyContact: null },
                { tshirtSize: { $exists: false } },
                { tshirtSize: null }
            ]
        });
        
        console.log(`Found ${usersToUpdate.length} users to update`);
        
        for (const user of usersToUpdate) {
            const updates = {};
            
            // Set default t-shirt size if not set
            if (!user.tshirtSize) {
                updates.tshirtSize = 'M';
            }
            
            // Set default emergency contact if not set
            if (!user.emergencyContact) {
                updates.emergencyContact = {
                    name: `${user.firstName} ${user.lastName} Emergency Contact`,
                    relationship: 'Emergency Contact',
                    phoneNumber: '555-0000',
                    email: 'emergency@example.com'
                };
            }
            
            if (Object.keys(updates).length > 0) {
                await User.findByIdAndUpdate(user._id, updates);
                console.log(`Updated user: ${user.email}`);
            }
        }
        
        console.log('User defaults update completed successfully!');
        
    } catch (error) {
        console.error('Error updating user defaults:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the update
updateUserDefaults(); 