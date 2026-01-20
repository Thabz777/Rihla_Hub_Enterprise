import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET_KEY || 'rihla-enterprise-jwt-secret-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // 7 days default (not 24 hours!)

/**
 * Generate JWT token
 */
export const generateToken = (userId) => {
    return jwt.sign(
        { userId, iat: Date.now() },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

/**
 * Authentication Middleware
 */
export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Get user from database
        const user = await User.findById(decoded.userId);

        if (!user || !user.is_active) {
            return res.status(401).json({ error: 'User not found or inactive' });
        }

        // Attach user to request
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

/**
 * Optional Auth Middleware (doesn't fail if no token)
 */
export const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = verifyToken(token);

            if (decoded) {
                const user = await User.findById(decoded.userId);
                if (user && user.is_active) {
                    req.user = user;
                    req.token = token;
                }
            }
        }
        next();
    } catch (error) {
        // Silently continue without auth
        next();
    }
};

/**
 * Role-based Authorization Middleware
 */
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};

/**
 * Permission-based Authorization Middleware
 */
export const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!req.user.permissions || !req.user.permissions[permission]) {
            return res.status(403).json({ error: `Permission required: ${permission}` });
        }

        next();
    };
};

export default {
    generateToken,
    verifyToken,
    authMiddleware,
    optionalAuthMiddleware,
    requireRole,
    requirePermission
};
