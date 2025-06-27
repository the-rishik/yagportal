const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: true,
    trim: true
  },
  numberOfStudents: {
    type: Number,
    required: true,
    min: 1
  },
  people: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    type: {
      type: String,
      required: true,
      enum: ['student', 'advisor']
    }
  }],
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved'],
    default: 'pending'
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
schoolSchema.index({ status: 1, createdAt: -1 });
schoolSchema.index({ schoolName: 1 });

module.exports = mongoose.model('School', schoolSchema); 