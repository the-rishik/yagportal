const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');
const School = require('../models/School');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, middleName, pronouns, namePronunciation, phoneNumber, school } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user with default values for required fields
        user = new User({
            email,
            password,
            firstName,
            lastName,
            middleName,
            pronouns,
            namePronunciation,
            phoneNumber,
            school,
            tshirtSize: 'M', // Default t-shirt size
            emergencyContact: {
                name: `${firstName} ${lastName} Emergency Contact`,
                relationship: 'Emergency Contact',
                phoneNumber: '555-0000',
                email: 'emergency@example.com'
            },
            mustChangePassword: password === 'njyag'
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
                middleName: user.middleName,
                pronouns: user.pronouns,
                namePronunciation: user.namePronunciation,
                phoneNumber: user.phoneNumber,
                school: user.school,
                foodAllergies: user.foodAllergies,
                tshirtSize: user.tshirtSize,
                emergencyContact: user.emergencyContact,
                role: user.role,
                createdAt: user.createdAt,
                mustChangePassword: user.mustChangePassword,
                mustCompleteProfile: user.mustCompleteProfile
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
                middleName: user.middleName,
                pronouns: user.pronouns,
                namePronunciation: user.namePronunciation,
                phoneNumber: user.phoneNumber,
                school: user.school,
                foodAllergies: user.foodAllergies,
                tshirtSize: user.tshirtSize,
                emergencyContact: user.emergencyContact,
                role: user.role,
                createdAt: user.createdAt,
                mustChangePassword: user.mustChangePassword,
                mustCompleteProfile: user.mustCompleteProfile
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
                middleName: user.middleName,
                pronouns: user.pronouns,
                namePronunciation: user.namePronunciation,
                phoneNumber: user.phoneNumber,
                school: user.school,
                foodAllergies: user.foodAllergies,
                tshirtSize: user.tshirtSize,
                emergencyContact: user.emergencyContact,
                role: user.role,
                createdAt: user.createdAt,
                mustChangePassword: user.mustChangePassword,
                mustCompleteProfile: user.mustCompleteProfile
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

// Get approved schools for registration (public endpoint)
router.get('/approved-schools', async (req, res) => {
    try {
        const schools = await School.find({ status: 'approved' })
            .select('schoolName')
            .sort({ schoolName: 1 });
        
        res.json(schools);
    } catch (error) {
        console.error('Error fetching approved schools:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile information
router.patch('/update-profile', auth, async (req, res) => {
    try {
        const { firstName, lastName, middleName, pronouns, namePronunciation, phoneNumber } = req.body;
        
        // Validate required fields
        if (!firstName || !lastName || !phoneNumber) {
            return res.status(400).json({ message: 'First name, last name, and phone number are required.' });
        }
        
        const user = await User.findById(req.user.userId || req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        // Update user fields
        user.firstName = firstName;
        user.lastName = lastName;
        user.middleName = middleName || '';
        user.pronouns = pronouns || '';
        user.namePronunciation = namePronunciation || '';
        user.phoneNumber = phoneNumber;
        user.mustCompleteProfile = false; // Mark profile as complete
        
        await user.save();
        
        res.json({ 
            message: 'Profile updated successfully.',
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                middleName: user.middleName,
                pronouns: user.pronouns,
                namePronunciation: user.namePronunciation,
                phoneNumber: user.phoneNumber,
                school: user.school,
                foodAllergies: user.foodAllergies,
                tshirtSize: user.tshirtSize,
                emergencyContact: user.emergencyContact,
                role: user.role,
                createdAt: user.createdAt,
                mustChangePassword: user.mustChangePassword,
                mustCompleteProfile: user.mustCompleteProfile
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change password for logged-in user
router.post('/change-password', auth, async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New passwords do not match.' });
        }
        const user = await User.findById(req.user.userId || req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect.' });
        }
        
        // Hash the password manually
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update password and mustChangePassword flag using findByIdAndUpdate
        await User.findByIdAndUpdate(
            user._id,
            {
                password: hashedPassword,
                mustChangePassword: false
            },
            { new: true, runValidators: false }
        );
        
        res.json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update account information - allows updating any profile field
router.patch('/account', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId || req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const {
            firstName,
            lastName,
            middleName,
            pronouns,
            namePronunciation,
            phoneNumber,
            school,
            foodAllergies,
            tshirtSize,
            emergencyContact,
            oldPassword,
            newPassword,
            confirmPassword
        } = req.body;

        // Handle password change if provided
        if (oldPassword && newPassword && confirmPassword) {
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'New passwords do not match.' });
            }
            
            const isMatch = await user.comparePassword(oldPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Old password is incorrect.' });
            }
            
            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;
            user.mustChangePassword = false;
        }

        // Update profile fields if provided
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (middleName !== undefined) user.middleName = middleName;
        if (pronouns !== undefined) user.pronouns = pronouns;
        if (namePronunciation !== undefined) user.namePronunciation = namePronunciation;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        if (school !== undefined) user.school = school;
        if (foodAllergies !== undefined) user.foodAllergies = foodAllergies;
        if (tshirtSize !== undefined) user.tshirtSize = tshirtSize;
        if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;

        // Validate required fields
        if (!user.firstName || !user.lastName || !user.phoneNumber) {
            return res.status(400).json({ message: 'First name, last name, and phone number are required.' });
        }

        // Validate t-shirt size and emergency contact
        if (!user.tshirtSize) {
            return res.status(400).json({ message: 'T-shirt size is required.' });
        }

        if (!user.emergencyContact || !user.emergencyContact.name || !user.emergencyContact.relationship || 
            !user.emergencyContact.phoneNumber || !user.emergencyContact.email) {
            return res.status(400).json({ message: 'Complete emergency contact information is required.' });
        }

        // Mark profile as complete if all required fields are present
        if (user.firstName && user.lastName && user.phoneNumber) {
            user.mustCompleteProfile = false;
        }

        await user.save();

        res.json({
            message: 'Account updated successfully.',
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                middleName: user.middleName,
                pronouns: user.pronouns,
                namePronunciation: user.namePronunciation,
                phoneNumber: user.phoneNumber,
                school: user.school,
                foodAllergies: user.foodAllergies,
                tshirtSize: user.tshirtSize,
                emergencyContact: user.emergencyContact,
                role: user.role,
                createdAt: user.createdAt,
                mustChangePassword: user.mustChangePassword,
                mustCompleteProfile: user.mustCompleteProfile
            }
        });
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 