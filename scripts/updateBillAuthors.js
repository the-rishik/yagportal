const mongoose = require('mongoose');
const Bill = require('../models/Bill');
const User = require('../models/User');
require('dotenv').config();

async function updateBillAuthors() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all bills
        const bills = await Bill.find().populate('author');
        console.log(`Found ${bills.length} bills to update`);

        // Update each bill
        for (const bill of bills) {
            if (bill.author) {
                // Get the user's full information
                const user = await User.findById(bill.author._id);
                if (user) {
                    // Update the bill's author reference
                    bill.author = user._id;
                    await bill.save();
                    console.log(`Updated bill "${bill.title}" with author: ${user.firstName} ${user.lastName}`);
                } else {
                    console.log(`User not found for bill "${bill.title}"`);
                }
            } else {
                console.log(`Bill "${bill.title}" has no author`);
            }
        }

        console.log('Finished updating bills');
    } catch (error) {
        console.error('Error updating bills:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

updateBillAuthors(); 