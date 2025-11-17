const Donation = require('../models/Donation');
const User = require('../models/User');
const Message = require('../models/Message');
const Cart = require('../models/Cart');
const Charity = require('../models/Charity');
// @desc    Get all donations (admin/charity)
// @route   GET /api/donations/all
// @access  Private/Admin/Charity
exports.getDonations = async (req, res, next) => {
  try {
    const { status, donationType, startDate, endDate } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (donationType) query.donationType = donationType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const donations = await Donation.find(query)
      .populate('user', 'name email')
      .populate('charity', 'name address')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get user's donations
// @route   GET /api/donations
// @access  Private
exports.getUserDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ user: req.user.id })
      .populate('charity', 'name address image')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single donation
// @route   GET /api/donations/:id
// @access  Private
exports.getDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('charity', 'name address image type');
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found'
      });
    }
    
    // Make sure user owns donation or is admin/charity
    if (donation.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this donation'
      });
    }
    
    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Create donation from cart
// @route   POST /api/donations
// @access  Private
exports.createDonation = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.charity');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }
    
    // Create donations for each cart item
    const donations = [];
    
    for (const item of cart.items) {
      const donation = await Donation.create({
        user: req.user.id,
        charity: item.charity._id,
        plates: item.plates,
        donationType: item.donationType,
        amount: item.amount,
        cautionDeposit: item.cautionDeposit,
        totalAmount: item.amount + item.cautionDeposit,
        status: 'confirmed',
        paymentStatus: 'completed'
      });
      
      donations.push(donation);
      
      // Update charity stats
      await Charity.findByIdAndUpdate(item.charity._id, {
        $inc: {
          totalDonationsReceived: item.amount,
          totalPlatesReceived: item.plates
        }
      });
      
      // Update user points and stats
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { 
          donorPoints: donation.pointsEarned,
          totalDonated: item.amount,
          totalDonations: 1
        }
      });
      
      // Create thank you message
      const messages = [
        `Your generous donation fed ${item.plates} ${item.plates > 1 ? 'families' : 'family'} today. Thank you for your kindness!`,
        `Thanks to you, ${item.plates} ${item.plates > 1 ? 'people' : 'person'} had nutritious meals. Your support means everything!`,
        `Your contribution helped us provide essential supplies to ${item.plates} ${item.plates > 1 ? 'people' : 'person'}. Grateful!`,
        `Your kindness brought smiles to ${item.plates} ${item.plates > 1 ? 'faces' : 'face'} today. Thank you so much!`,
        `${item.plates} ${item.plates > 1 ? 'families are' : 'family is'} blessed by your generosity. We deeply appreciate you!`
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      await Message.create({
        user: req.user.id,
        charity: item.charity._id,
        donation: donation._id,
        message: randomMessage,
        points: donation.pointsEarned
      });
    }
    
    // Clear cart
    cart.items = [];
    await cart.save();
    
    res.status(201).json({
      success: true,
      count: donations.length,
      data: donations,
      message: 'Donations created successfully'
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update donation status
// @route   PUT /api/donations/:id
// @access  Private/Admin/Charity
exports.updateDonationStatus = async (req, res, next) => {
  try {
    const { status, deliveryDate, notes } = req.body;
    
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found'
      });
    }
    
    donation.status = status || donation.status;
    donation.deliveryDate = deliveryDate || donation.deliveryDate;
    donation.notes = notes || donation.notes;
    
    // If delivered, set delivery date if not already set
    if (status === 'delivered' && !donation.deliveryDate) {
      donation.deliveryDate = new Date();
    }
    
    await donation.save();
    
    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Refund caution deposit
// @route   POST /api/donations/:id/refund
// @access  Private/Admin
exports.refundCautionDeposit = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found'
      });
    }
    
    if (donation.cautionDeposit === 0) {
      return res.status(400).json({
        success: false,
        error: 'No caution deposit to refund'
      });
    }
    
    if (donation.cautionDepositRefunded) {
      return res.status(400).json({
        success: false,
        error: 'Caution deposit already refunded'
      });
    }
    
    if (donation.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        error: 'Can only refund deposit for delivered donations'
      });
    }
    
    donation.cautionDepositRefunded = true;
    donation.cautionDepositRefundDate = new Date();
    donation.paymentStatus = 'refunded';
    
    await donation.save();
    
    res.status(200).json({
      success: true,
      data: donation,
      message: `Caution deposit of ₹${donation.cautionDeposit} refunded successfully`
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
