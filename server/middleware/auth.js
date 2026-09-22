const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const [users] = await pool.query(
            'SELECT id, name, email, role FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        req.user = users[0];
        req.userId = users[0].id;
        req.userRole = users[0].role;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Authentication error.',
            error: error.message
        });
    }
};

const authorizeFarmer = (req, res, next) => {
    if (req.userRole !== 'farmer') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Farmer only.'
        });
    }
    next();
};

const authorizeCustomer = (req, res, next) => {
    if (req.userRole !== 'customer') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Customer only.'
        });
    }
    next();
};

module.exports = {
    authenticate,
    authorizeFarmer,
    authorizeCustomer
};