const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  charity: {
    type: mongoose.Schema.ObjectId,
    ref: 'Charity',
    required: true
  },
  charityName: {
    type: String,
    required: true
  },
  plates: {
    type: Number,
    required: true,
    min: 1
  },
  amount: {
    type: Number,
    required: true
  },
  donationType: {
    type: String,
    enum: ['food', 'money'],
    required: true
  },
  cautionDeposit: {
    type: Number,
    default: 0
  },
  pricePerPlate: {
    type: Number,
    required: true
  }
});

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [CartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  totalCautionDeposit: {
    type: Number,
    default: 0
  },
  totalPlates: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update totals before saving
CartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);
  this.totalCautionDeposit = this.items.reduce((sum, item) => sum + item.cautionDeposit, 0);
  this.totalPlates = this.items.reduce((sum, item) => sum + item.plates, 0);
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Cart', CartSchema);