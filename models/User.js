const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    middleName: {
        type: String,
        required: false,
        trim: true
    },
    pronouns: {
        type: String,
        required: false,
        trim: true
    },
    namePronunciation: {
        type: String,
        required: false,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    school: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'advisor', 'staff', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    mustChangePassword: {
        type: Boolean,
        default: false,
    },
    mustCompleteProfile: {
        type: Boolean,
        default: false,
    },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user is admin
userSchema.methods.isAdmin = function() {
    return this.role === 'admin';
};

const User = mongoose.model('User', userSchema);

module.exports = User; 