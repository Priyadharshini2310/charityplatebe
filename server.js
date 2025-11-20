const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors'); 

// Load env vars from config.env
dotenv.config({ path: './config/config.env' });
// dotenv.config();

// DEBUG: Check if env vars are loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Loaded' : '❌ Not Loaded');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Connect to database
connectDB();

// Route files
const feedback = require('./routes/feedbackRoutes');
const auth = require('./routes/authRoutes');
const charityRoutes = require('./routes/charityRoutes');
const cartRoutes = require('./routes/cartRoutes');
const donationRoutes = require('./routes/donationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const app = express();

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/feedback', feedback);
app.use('/api/auth', auth);
app.use('/api/charity', charityRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/messages', messageRoutes)
const PORT = process.env.PORT || 5100;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});