const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const auth = require('../middleware/auth');

// Create a new bill
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, category } = req.body;
        
        const bill = new Bill({
            title,
            content,
            category,
            author: req.user._id,
            school: req.user.school
        });

        await bill.save();
        res.status(201).json(bill);
    } catch (error) {
        res.status(500).json({ message: 'Error creating bill', error: error.message });
    }
});

// Get all bills (with optional filtering)
router.get('/', auth, async (req, res) => {
    try {
        const { status, category, school } = req.query;
        const query = {};

        if (status) query.status = status;
        if (category) query.category = category;
        if (school) query.school = school;

        const bills = await Bill.find(query)
            .populate('author', 'firstName lastName email school')
            .sort({ createdAt: -1 });

        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bills', error: error.message });
    }
});

// Get user's bills
router.get('/my-bills', auth, async (req, res) => {
    try {
        const bills = await Bill.find({ author: req.user._id })
            .sort({ createdAt: -1 });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user bills', error: error.message });
    }
});

// Get a specific bill
router.get('/:id', auth, async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id)
            .populate('author', 'firstName lastName email school')
            .populate('comments.author', 'firstName lastName');
            
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        
        res.json(bill);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bill', error: error.message });
    }
});

// Update a bill
router.patch('/:id', auth, async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        // Check if user is the author
        if (bill.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this bill' });
        }

        // Only allow updates if bill is in draft status
        if (bill.status !== 'draft') {
            return res.status(400).json({ message: 'Can only update bills in draft status' });
        }

        const updates = Object.keys(req.body);
        const allowedUpdates = ['title', 'content', 'category'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        updates.forEach(update => bill[update] = req.body[update]);
        await bill.save();

        res.json(bill);
    } catch (error) {
        res.status(500).json({ message: 'Error updating bill', error: error.message });
    }
});

// Submit a bill for review
router.patch('/:id/submit', auth, async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        if (bill.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to submit this bill' });
        }

        if (bill.status !== 'draft') {
            return res.status(400).json({ message: 'Can only submit bills in draft status' });
        }

        bill.status = 'submitted';
        await bill.save();

        res.json(bill);
    } catch (error) {
        res.status(500).json({ message: 'Error submitting bill', error: error.message });
    }
});

// Add a comment to a bill
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        bill.comments.push({
            text: req.body.text,
            author: req.user._id
        });

        await bill.save();
        res.json(bill);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
});

module.exports = router; 