const mongoose = require('mongoose');
const User = require('../../models/User');
const Bill = require('../../models/Bill');
const School = require('../../models/School');

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB URI:', process.env.MONGODB_URI); // Debug log
    
    // Close any existing connection first
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Closed existing MongoDB connection');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Test database connected');
  } catch (error) {
    console.error('Test database connection error:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('Test database disconnected');
  } catch (error) {
    console.error('Test database disconnection error:', error);
  }
};

const clearDB = async () => {
  try {
    // Drop all collections to ensure complete cleanup
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.drop();
    }
    console.log('Test database cleared');
  } catch (error) {
    console.error('Test database clear error:', error);
    // If drop fails, try deleteMany as fallback
    try {
      await User.deleteMany({});
      await Bill.deleteMany({});
      await School.deleteMany({});
      console.log('Test database cleared (fallback method)');
    } catch (fallbackError) {
      console.error('Test database clear fallback error:', fallbackError);
    }
  }
};

const createTestUser = async (userData = {}) => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const defaultUser = {
    email: `test-${timestamp}-${randomId}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    school: 'Test School',
    role: 'Student'
  };

  const user = new User({ ...defaultUser, ...userData });
  await user.save();
  return user;
};

const createTestAdmin = async () => {
  return createTestUser({
    email: 'admin@example.com',
    role: 'admin'
  });
};

const createTestBill = async (billData = {}) => {
  const user = await createTestUser();
  
  const defaultBill = {
    title: 'Test Bill',
    content: 'This is a test bill content',
    category: 'environment',
    author: user._id,
    school: user.school,
    status: 'draft'
  };

  const bill = new Bill({ ...defaultBill, ...billData });
  await bill.save();
  return bill;
};

module.exports = {
  connectDB,
  disconnectDB,
  clearDB,
  createTestUser,
  createTestAdmin,
  createTestBill
}; 