const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Bill = require('../models/Bill');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const School = require('../models/School');

// Get all users (admin only)
router.get('/users', [auth, admin], async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all bills (admin only)
router.get('/bills', [auth, admin], async (req, res) => {
    try {
        const bills = await Bill.find()
            .populate('author', 'firstName lastName email school')
            .sort({ createdAt: -1 });
        console.log('Sending bills:', bills);
        res.json(bills);
    } catch (error) {
        console.error('Error fetching bills:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search bills (admin only)
router.get('/search', [auth, admin], async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const searchRegex = new RegExp(q, 'i');
        const bills = await Bill.find({
            $or: [
                { title: searchRegex },
                { content: searchRegex }
            ]
        }).populate('author', 'firstName lastName email school');

        res.json(bills);
    } catch (error) {
        console.error('Error searching bills:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change user role (admin only)
router.post('/change-role/:userId', [auth, admin], async (req, res) => {
    try {
        const { role } = req.body;
        const { userId } = req.params;

        // Validate role
        const validRoles = ['user', 'advisor', 'staff', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from changing their own role
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot change your own role' });
        }

        user.role = role;
        await user.save();

        res.json({ message: 'User role updated successfully', user });
    } catch (error) {
        console.error('Error changing user role:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Legacy promote endpoint (for backward compatibility)
router.post('/promote/:userId', [auth, admin], async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = 'admin';
        await user.save();

        res.json({ message: 'User promoted to admin', user });
    } catch (error) {
        console.error('Error promoting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all schools (admin only)
router.get('/schools', [auth, admin], async (req, res) => {
    try {
        const schools = await School.find()
            .populate('registeredBy', 'firstName lastName email')
            .sort({ createdAt: -1 });
        
        console.log('Admin requesting schools, found:', schools.length);
        console.log('Schools:', schools);
        
        res.json(schools);
    } catch (error) {
        console.error('Error fetching schools:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Approve a school (admin only)
router.put('/schools/:id/approve', [auth, admin], async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }
        
        if (school.status === 'approved') {
            return res.status(400).json({ message: 'School is already approved' });
        }
        
        school.status = 'approved';
        await school.save();
        
        res.json({ message: 'School approved successfully', school });
    } catch (error) {
        console.error('Error approving school:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a school (admin only)
router.put('/schools/:id', [auth, admin], async (req, res) => {
    try {
        const { schoolName, numberOfStudents, people } = req.body;
        
        const school = await School.findById(req.params.id);
        
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }
        
        // Clean up people array by removing invalid id fields
        const cleanedPeople = people.map(person => {
            const { id, _id, ...cleanPerson } = person;
            return cleanPerson;
        });
        
        // Update school information
        school.schoolName = schoolName;
        school.numberOfStudents = numberOfStudents;
        school.people = cleanedPeople;
        
        await school.save();
        
        res.json({ message: 'School updated successfully', school });
    } catch (error) {
        console.error('Error updating school:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 