const mongoose = require('mongoose');
const Bill = require('../models/Bill');
const User = require('../models/User');
require('dotenv').config();

async function checkBillAuthors() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all bills with populated author
        const bills = await Bill.find().populate('author');
        console.log(`Found ${bills.length} bills`);

        // Check each bill
        for (const bill of bills) {
            console.log('\nBill:', bill.title);
            console.log('Author ID:', bill.author ? bill.author._id : 'No author');
            
            if (bill.author) {
                console.log('Author details:', {
                    firstName: bill.author.firstName,
                    lastName: bill.author.lastName,
                    email: bill.author.email
                });

                // Verify the user exists
                const user = await User.findById(bill.author._id);
                if (user) {
                    console.log('User found in database:', {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email
                    });

                    // Update the bill's author reference if needed
                    if (bill.author._id.toString() !== user._id.toString()) {
                        bill.author = user._id;
                        await bill.save();
                        console.log('Updated bill author reference');
                    }
                } else {
                    console.log('User not found in database!');
                }
            } else {
                console.log('No author information available');
            }
        }

        console.log('\nFinished checking bills');
    } catch (error) {
        console.error('Error checking bills:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

checkBillAuthors(); 