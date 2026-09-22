const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Register user
const register = async (req, res) => {
    try {
        const { name, email, password, role, phone, address, farm_name, farm_location } = req.body;

        // Check if user already exists
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user
        const [result] = await pool.query(
            `INSERT INTO users (name, email, password, role, phone, address, farm_name, farm_location) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, role, phone || null, address || null, farm_name || null, farm_location || null]
        );

        // Generate JWT token
        const token = jwt.sign(
            { id: result.insertId, email, role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: result.insertId,
                name,
                email,
                role,
                phone: phone || null,
                address: address || null
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get user by email
        const [users] = await pool.query(
            'SELECT id, name, email, password, role, phone, address, farm_name, farm_location FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone || null,
                address: user.address || null
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        
        const [users] = await pool.query(
            `SELECT id, name, email, role, phone, address, profile_image, bio, 
                    farm_name, farm_location, created_at 
             FROM users WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser
};