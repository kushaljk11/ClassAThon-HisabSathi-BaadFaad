/**
 * @file config/database.js
 * @description MongoDB connection utility using Mongoose. Reads MONGO_URI from environment and
 * exits process on failure to prevent the app from running in a bad state.
 */
import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// cannot reach the system DNS (prevents `querySrv ECONNREFUSED`).
dns.setServers(['8.8.8.8', '1.1.1.1']);

/**
 * Connect to MongoDB.
 * @returns {Promise<void>} Resolves when connected; exits process on fatal error.
 */
const connectDB = async () => {
  try {
    console.log('Using DNS servers:', dns.getServers());
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
