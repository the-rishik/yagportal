const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ message: 'No authorization header' });
        }

        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Make sure JWT_SECRET is available
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET is not set in environment variables');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        try {
            const decoded = jwt.verify(token, jwtSecret);
            const user = await User.findOne({ _id: decoded.userId });

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Set both the full user object and the userId
            req.user = {
                ...user.toObject(),
                userId: user._id
            };
            req.token = token;
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Please authenticate.', error: error.message });
    }
};

module.exports = auth; 