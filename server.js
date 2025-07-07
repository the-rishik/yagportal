const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Bill = require('./models/Bill');
const User = require('./models/User');
const School = require('./models/School');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/admin', require('./routes/admin'));

// Stats endpoint for counts
app.get('/api/stats', async (req, res) => {
    try {
        // Count active bills (status: submitted, reviewed, approved)
        const activeBillStatuses = ['submitted', 'reviewed', 'approved'];
        const activeBillsCount = await Bill.countDocuments({ status: { $in: activeBillStatuses } });
        const usersCount = await User.countDocuments();
        const schoolsCount = await School.countDocuments();
        res.json({
            activeBills: activeBillsCount,
            registeredUsers: usersCount,
            schools: schoolsCount
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// MongoDB Connection and Server Start
const MONGODB_URI = 'mongodb://localhost:27017/njyag';
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
    // Start server only after MongoDB connects
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Try accessing the server at:`);
        console.log(`- http://localhost:${PORT}`);
        console.log(`- http://127.0.0.1:${PORT}`);
    });
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if MongoDB connection fails
}); 