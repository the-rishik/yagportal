const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const School = require('../models/School');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, school } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        user = new User({
            email,
            password,
            firstName,
            lastName,
            school
        });

        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                school: user.school,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                school: user.school,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ 
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                school: user.school,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.patch('/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'email', 'password', 'delegation'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates!' });
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.json({
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                delegation: req.user.delegation,
                role: req.user.role
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Register a school
router.post('/register-school', auth, async (req, res) => {
    try {
        const { schoolName, numberOfStudents, people } = req.body;
        const userId = req.user._id;

        // Check if user is an advisor
        if (req.user.role !== 'advisor') {
            return res.status(403).json({ message: 'Only advisors can register schools' });
        }

        // Check if user has already registered a school
        const existingSchool = await School.findOne({ registeredBy: userId });
        if (existingSchool) {
            return res.status(400).json({ message: 'You have already registered a school' });
        }

        // Create new school
        const school = new School({
            schoolName,
            numberOfStudents,
            people,
            registeredBy: userId
        });

        await school.save();

        res.status(201).json({ 
            message: 'School registered successfully and awaiting approval',
            school 
        });
    } catch (error) {
        console.error('Error registering school:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's school status
router.get('/my-school', auth, async (req, res) => {
    try {
        const userId = req.user._id;
        
        const school = await School.findOne({ registeredBy: userId });
        
        if (!school) {
            return res.status(404).json({ message: 'No school registered' });
        }
        
        res.json({ school });
    } catch (error) {
        console.error('Error fetching user school:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user's school (advisor only)
router.put('/my-school', auth, async (req, res) => {
    try {
        const { schoolName, numberOfStudents, people } = req.body;
        const userId = req.user._id;
        
        // Check if user is an advisor
        if (req.user.role !== 'advisor') {
            return res.status(403).json({ message: 'Only advisors can update schools' });
        }
        
        const school = await School.findOne({ registeredBy: userId });
        
        if (!school) {
            return res.status(404).json({ message: 'No school found for this user' });
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