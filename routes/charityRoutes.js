
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Charity = require('../models/Charity');
const Donation = require('../models/Donation');
const Message = require('../models/Message');
const User = require('../models/User');

// Import controller functions for public routes
const {
  getCharities,
  getCharity,
  createCharity,
  updateCharity,
  deleteCharity,
  getCharitiesInRadius,
  createCharitiesBulk,
  getCharityByUser
} = require('../controllers/charityController');

console.log('🏥 Loading Charity Routes...');

// ============================================
// SPECIAL ROUTES - Must come first
// ============================================

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Charity routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Bulk create - must come before /:id to avoid conflicts
router.post('/bulk', createCharitiesBulk);

// Radius search - must come before /:id
router.get('/radius/:zipcode/:distance', getCharitiesInRadius);

// @route   GET /api/charity/profile
router.get('/profile', protect, authorize('charity'), async (req, res) => {
  try {
    console.log('📋 Fetching charity profile for user:', req.user.id);
    
    let charity = await Charity.findOne({ userId: req.user.id });
    
    if (!charity) {
      console.log('⚠️  No charity profile found, creating default one');
      charity = await Charity.create({
        userId: req.user.id,
        name: "",
        address: '',
        pricePerPlate: 0,
        type: 'both',
        isActive: true
      });
    }

    console.log('✅ Charity profile retrieved');
    res.json(charity);
  } catch (error) {
    console.error('❌ Error fetching charity profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/charity/profile
// @desc    Update charity profile
// @access  Private (Charity only)
// router.put('/profile', async (req, res) => {
//   try {
//     // Since there's no auth, you need to get userId from request body or params
//     const userId = req.body.userId; // or req.query.userId or req.params.userId
    
//     if (!userId) {
//       return res.status(400).json({ message: 'User ID is required' });
//     }
    
//     console.log('📝 Updating charity profile for user:', userId);
    
//     const { name, address, pricePerPlate, type, isActive, description, distance, contactEmail, contactPhone, image, rating, reviews } = req.body;

//     let charity = await Charity.findOne({ userId: userId });

//     const updateData = {
//       name: name || charity?.name || 'Organization',
//       address: address || charity?.address || 'Please update your address',
//       pricePerPlate: pricePerPlate !== undefined ? pricePerPlate : (charity?.pricePerPlate || 50),
//       type: type || charity?.type || 'both',
//       isActive: isActive !== undefined ? isActive : (charity?.isActive !== undefined ? charity.isActive : true),
//       description: description || charity?.description,
//       contactEmail: contactEmail || charity?.contactEmail,
//       contactPhone: contactPhone || charity?.contactPhone,
//       distance: distance !== undefined ? distance : (charity?.distance || 10),
//       image: image || charity?.image || '',
//       rating: rating !== undefined ? rating : (charity?.rating || 0),
//       reviews: reviews !== undefined ? reviews : (charity?.reviews || '')
//     };

//     if (!charity) {
//       console.log('📝 Creating new charity profile');
//       charity = await Charity.create({
//         userId: userId,
//         ...updateData
//       });
//     } else {
//       console.log('📝 Updating existing charity profile');
//       Object.keys(updateData).forEach(key => {
//         if (updateData[key] !== undefined) {
//           charity[key] = updateData[key];
//         }
//       });
//       await charity.save();
//     }

//     console.log('✅ Charity profile updated successfully');
//     res.json(charity);
//   } catch (error) {
//     console.error('❌ Error updating charity profile:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });
// @route   POST /api/charity/profile
// @desc    Create charity profile
// @access  Private (Charity only)
router.post('/profile', protect, authorize('charity'), async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📝 Creating charity profile for user:', userId);
    
    // Check if profile already exists
    let charity = await Charity.findOne({ userId: userId });
    
    if (charity) {
      return res.status(400).json({ message: 'Charity profile already exists. Use PUT to update.' });
    }
    
    const { name, address, pricePerPlate, type, distance, contactPhone } = req.body;

    charity = await Charity.create({
      userId: userId,
      name: name || 'Organization',
      address: address || '',
      pricePerPlate: pricePerPlate || 50,
      type: type || 'both',
      distance: distance || 10,
      contactPhone: contactPhone || '',
      isActive: true
    });

    console.log('✅ Charity profile created successfully');
    res.json(charity);
  } catch (error) {
    console.error('❌ Error creating charity profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// @route   PUT /api/charity/profile
// @desc    Update charity profile
// @access  Private (Charity only)
router.put('/profile', protect, authorize('charity'), async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    
    console.log('📝 Updating charity profile for user:', userId);
    
    const { name, address, pricePerPlate, type, isActive, description, distance, contactEmail, contactPhone, image, rating, reviews } = req.body;

    let charity = await Charity.findOne({ userId: userId });

    const updateData = {
      name: name || charity?.name || 'Organization',
      address: address || charity?.address || 'Please update your address',
      pricePerPlate: pricePerPlate !== undefined ? pricePerPlate : (charity?.pricePerPlate || 50),
      type: type || charity?.type || 'both',
      isActive: isActive !== undefined ? isActive : (charity?.isActive !== undefined ? charity.isActive : true),
      description: description || charity?.description,
      contactEmail: contactEmail || charity?.contactEmail,
      contactPhone: contactPhone || charity?.contactPhone,
      distance: distance !== undefined ? distance : (charity?.distance || 10),
      image: image || charity?.image || '',
      rating: rating !== undefined ? rating : (charity?.rating || 0),
      reviews: reviews !== undefined ? reviews : (charity?.reviews || '')
    };

    if (!charity) {
      console.log('📝 Creating new charity profile');
      charity = await Charity.create({
        userId: userId,
        ...updateData
      });
    } else {
      console.log('📝 Updating existing charity profile');
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          charity[key] = updateData[key];
        }
      });
      await charity.save();
    }

    console.log('✅ Charity profile updated successfully');
    res.json(charity);
  } catch (error) {
    console.error('❌ Error updating charity profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// routes/charityRoutes.js
router.put("/feedback/:id", protect, async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ success: false, message: "Charity not found" });

    const { rating, review } = req.body;

    // update average rating and reviews
    if (rating) {
      charity.rating = (charity.rating + rating) / 2; // simple average; you can store all ratings if needed
    }

    if (review) {
      charity.reviews = charity.reviews
        ? `${charity.reviews}\n${review}`
        : review;
    }

    await charity.save();

    res.json({ success: true, message: "Feedback submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/charity/donations
// @desc    Get all donations received by this charity
// @access  Private (Charity only)
router.get('/donations', protect, authorize('charity'), async (req, res) => {
  try {
    console.log('💰 Fetching donations for charity user:', req.user.id);
    
    const charity = await Charity.findOne({ userId: req.user.id });

    if (!charity) {
      console.log('⚠️  Charity profile not found');
      return res.json({ 
        message: 'Charity profile not found. Please complete your profile first.',
        donations: [] 
      });
    }

    console.log('🔍 Searching donations for charity:', charity._id);

    const donations = await Donation.find({ charity: charity._id })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${donations.length} donations`);

    res.json(donations);
  } catch (error) {
    console.error('❌ Error fetching donations:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      donations: [] 
    });
  }
});

// @route   GET /api/charity/sent-messages
// @desc    Get all thank you messages sent by this charity
// @access  Private (Charity only)
router.get('/sent-messages', protect, authorize('charity'), async (req, res) => {
  try {
    console.log('💌 Fetching sent messages for charity user:', req.user.id);
    
    const charity = await Charity.findOne({ userId: req.user.id });

    if (!charity) {
      console.log('⚠️  Charity profile not found');
      return res.json([]);
    }

    console.log('🔍 Searching messages for charity:', charity._id);

    const messages = await Message.find({ charity: charity._id })
      .populate('user', 'name email phone')
      .populate('donation', 'plates donationType totalAmount')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${messages.length} messages`);

    res.json(messages);
  } catch (error) {
    console.error('❌ Error fetching sent messages:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message
    });
  }
});

// @route   POST /api/charity/thank-you
// @desc    Send thank you message to donor
// @access  Private (Charity only)
router.post('/thank-you', protect, authorize('charity'), async (req, res) => {
  try {
    console.log('💌 Sending thank you message');
    const { donationId, userId, message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message is required' });
    }

    const charity = await Charity.findOne({ userId: req.user.id });

    if (!charity) {
      return res.status(404).json({ message: 'Charity profile not found' });
    }

    const donation = await Donation.findOne({
      _id: donationId,
      charity: charity._id
    });

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found or does not belong to your charity' });
    }

    const thankYouMessage = await Message.create({
      user: userId,
      charity: charity._id,
      donation: donationId,
      message: message,
      points: 50
    });

    await User.findByIdAndUpdate(userId, {
      $inc: { points: 50 }
    });

    console.log('✅ Thank you message sent successfully');
    res.json({
      message: 'Thank you message sent successfully',
      data: thankYouMessage
    });
  } catch (error) {
    console.error('❌ Error sending thank you message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/charity/thank-you/:id
// @desc    Update a thank you message
// @access  Private (Charity only)
router.put('/thank-you/:id', protect, authorize('charity'), async (req, res) => {
  try {
    console.log('✏️ Updating thank you message:', req.params.id);
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message is required' });
    }

    const charity = await Charity.findOne({ userId: req.user.id });

    if (!charity) {
      return res.status(404).json({ message: 'Charity profile not found' });
    }

    const thankYouMessage = await Message.findOne({
      _id: req.params.id,
      charity: charity._id
    });

    if (!thankYouMessage) {
      return res.status(404).json({ message: 'Message not found or does not belong to your charity' });
    }

    thankYouMessage.message = message;
    await thankYouMessage.save();

    console.log('✅ Thank you message updated successfully');
    res.json({
      message: 'Thank you message updated successfully',
      data: thankYouMessage
    });
  } catch (error) {
    console.error('❌ Error updating thank you message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/charity/thank-you/:id
// @desc    Delete a thank you message
// @access  Private (Charity only)
router.delete('/thank-you/:id', protect, authorize('charity'), async (req, res) => {
  try {
    console.log('🗑️ Deleting thank you message:', req.params.id);

    const charity = await Charity.findOne({ userId: req.user.id });

    if (!charity) {
      return res.status(404).json({ message: 'Charity profile not found' });
    }

    const thankYouMessage = await Message.findOne({
      _id: req.params.id,
      charity: charity._id
    });

    if (!thankYouMessage) {
      return res.status(404).json({ message: 'Message not found or does not belong to your charity' });
    }

    // Remove the points from the user
    await User.findByIdAndUpdate(thankYouMessage.user, {
      $inc: { points: -thankYouMessage.points }
    });

    await Message.findByIdAndDelete(req.params.id);

    console.log('✅ Thank you message deleted successfully');
    res.json({
      message: 'Thank you message deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting thank you message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/charity/stats
// @desc    Get charity statistics
// @access  Private (Charity only)
router.get('/stats', protect, authorize('charity'), async (req, res) => {
  try {
    console.log('📊 Fetching charity stats');
    const charity = await Charity.findOne({ userId: req.user.id });

    if (!charity) {
      return res.status(404).json({ message: 'Charity profile not found' });
    }

    const donations = await Donation.find({ charity: charity._id });

    const stats = {
      totalDonations: charity.totalDonationsReceived,
      totalPlates: charity.totalPlatesReceived,
      rating: charity.rating,
      reviews: charity.reviews,
      recentDonations: donations.slice(0, 5),
      donationsByStatus: {
        pending: donations.filter(d => d.status === 'pending').length,
        confirmed: donations.filter(d => d.status === 'confirmed').length,
        inTransit: donations.filter(d => d.status === 'in-transit').length,
        delivered: donations.filter(d => d.status === 'delivered').length,
        cancelled: donations.filter(d => d.status === 'cancelled').length
      },
      donationsByType: {
        food: donations.filter(d => d.donationType === 'food').length,
        money: donations.filter(d => d.donationType === 'money').length
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching charity stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// PUBLIC ROUTES - For browsing charities
// These come LAST to avoid conflicts with specific routes above
// ============================================

// GET /api/charity - List all charities (public)
router.get('/', getCharities);

// POST /api/charity - Create new charity (public)
router.post('/', createCharity);
// GET /api/charity/byUser/:userId - Get charity by user ID (public)
router.route('/byUser/:userId').get(getCharityByUser); // 👈 Use .get() method
// GET /api/charity/:id - Get single charity by ID (public)
// This must be LAST to avoid matching routes like /profile, /donations, etc.
router.get('/:id', getCharity);

// PUT /api/charity/:id - Update charity
router.put('/:id', updateCharity);

// DELETE /api/charity/:id - Delete charity
router.delete('/:id', deleteCharity);

console.log('✅ Charity Routes Module Loaded Successfully');

module.exports = router;