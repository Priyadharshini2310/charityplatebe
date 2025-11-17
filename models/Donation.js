const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  charity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Charity',
    required: true
  },
  plates: {
    type: Number,
    required: [true, 'Please specify number of plates'],
    min: [1, 'Plates must be at least 1']
  },
  donationType: {
    type: String,
    enum: ['food', 'money'],
    required: [true, 'Please specify donation type']
  },
  amount: {
    type: Number,
    required: [true, 'Please add donation amount'],
    min: [0, 'Amount cannot be negative']
  },
  cautionDeposit: {
    type: Number,
    default: 0,
    min: [0, 'Caution deposit cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  cautionDepositRefunded: {
    type: Boolean,
    default: false
  },
  cautionDepositRefundDate: {
    type: Date
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  deliveryDate: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Calculate points earned (10 points per plate)
DonationSchema.pre('save', function(next) {
  if (!this.pointsEarned) {
    this.pointsEarned = this.plates * 10;
  }
  next();
});

module.exports = mongoose.model('Donation', DonationSchema);