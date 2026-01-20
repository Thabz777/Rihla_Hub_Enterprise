import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'rihla_enterprise';

let isConnected = false;

/**
 * Connect to MongoDB with retry logic
 */
export const connectDB = async () => {
    if (isConnected) {
        console.log('✅ Using existing MongoDB connection');
        return;
    }

    if (!MONGO_URL) {
        throw new Error('❌ MONGO_URL environment variable is not set');
    }

    try {
        const options = {
            dbName: DB_NAME,
            // Connection pool settings
            maxPoolSize: 10,
            minPoolSize: 5,
            // Timeout settings
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            // Write concern for data safety
            w: 'majority',
            // Retry writes automatically
            retryWrites: true
        };

        console.log('🔄 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGO_URL, options);

        isConnected = true;
        console.log('✅ MongoDB Atlas connected successfully');
        console.log(`📦 Database: ${DB_NAME}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
            isConnected = false;
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
            isConnected = true;
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔌 MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        throw error;
    }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDB = async () => {
    if (isConnected) {
        await mongoose.connection.close();
        isConnected = false;
        console.log('🔌 MongoDB connection closed');
    }
};

/**
 * Get connection status
 */
export const getConnectionStatus = () => ({
    isConnected,
    readyState: mongoose.connection.readyState,
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    status: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
});

export default { connectDB, disconnectDB, getConnectionStatus };
