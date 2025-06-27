const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/njyag', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('Connected to MongoDB');
    
    try {
        // Find the user by email
        const user = await User.findOne({ email: 'rishiknarayana@gmail.com' });
        
        if (!user) {
            console.log('User not found. Please register first.');
            process.exit(1);
        }

        // Update user role to admin
        user.role = 'admin';
        await user.save();
        
        console.log('User has been made an admin successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
}); 