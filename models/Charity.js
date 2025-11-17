// // // models/Charity.js
// // const mongoose = require('mongoose');

// // const CharitySchema = new mongoose.Schema({
// //   name: {
// //     type: String,
// //     required: [true, 'Please add a charity name'],
// //     trim: true,
// //     maxlength: [100, 'Name cannot be more than 100 characters']
// //   },
// //   address: {
// //     type: String,
// //     required: [true, 'Please add an address']
// //   },
// //   location: {
// //     type: {
// //       type: String,
// //       enum: ['Point'],
// //       default: 'Point'
// //     },
// //     coordinates: {
// //       type: [Number],
// //       index: '2dsphere'
// //     }
// //   },
// //   distance: {
// //     type: Number,
// //     default: 0
// //   },
// //   rating: {
// //     type: Number,
// //     min: [1, 'Rating must be at least 1'],
// //     max: [5, 'Rating cannot be more than 5'],
// //     default: 4.5
// //   },
// //   reviews: {
// //     type: Number,
// //     default: 0
// //   },
// //   image: {
// //     type: String,
// //     default: '🏠'
// //   },
// //   pricePerPlate: {
// //     type: Number,
// //     required: [true, 'Please add price per plate'],
// //     min: [0, 'Price cannot be negative']
// //   },
// //   type: {
// //     type: String,
// //     enum: ['food', 'money', 'both'],
// //     required: [true, 'Please specify donation type']
// //   },
// //   isActive: {
// //     type: Boolean,
// //     default: true
// //   },
// //   totalDonationsReceived: {
// //     type: Number,
// //     default: 0
// //   },
// //   totalPlatesReceived: {
// //     type: Number,
// //     default: 0
// //   }
// // }, {
// //   timestamps: true
// // });

// // // Create index for geospatial queries
// // CharitySchema.index({ location: '2dsphere' });

// // module.exports = mongoose.model('Charity', CharitySchema);
// const mongoose = require('mongoose');

// const CharitySchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   name: {
//     type: String,
//     required: [true, 'Please add a charity name'],
//     trim: true,
//     maxlength: [100, 'Name cannot be more than 100 characters']
//   },
//   address: {
//     type: String,
//     required: [true, 'Please add an address']
//   },
//   location: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       default: 'Point'
//     },
//     coordinates: {
//       type: [Number],
//       index: '2dsphere'
//     }
//   },
//   distance: {
//     type: Number,
//     default: 0
//   },
//   rating: {
//     type: Number,
//     min: [1, 'Rating must be at least 1'],
//     max: [5, 'Rating cannot be more than 5'],
//     default: 4.5
//   },
//   reviews: {
//     type: Number,
//     default: 0
//   },
//   image: {
//     type: String,
//     default: '🏠'
//   },
//   pricePerPlate: {
//     type: Number,
//     required: [true, 'Please add price per plate'],
//     min: [0, 'Price cannot be negative']
//   },
//   type: {
//     type: String,
//     enum: ['food', 'money', 'both'],
//     required: [true, 'Please specify donation type']
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   totalDonationsReceived: {
//     type: Number,
//     default: 0
//   },
//   totalPlatesReceived: {
//     type: Number,
//     default: 0
//   },
//   description: {
//     type: String,
//     maxlength: [500, 'Description cannot be more than 500 characters']
//   },
//   contactEmail: {
//     type: String
//   },
//   contactPhone: {
//     type: String
//   }
// }, {
//   timestamps: true
// });

// // Create index for geospatial queries
// CharitySchema.index({ location: '2dsphere' });

// // Update charity stats when donation is made
// CharitySchema.methods.updateStats = async function(plates, amount) {
//   this.totalPlatesReceived += plates;
//   this.totalDonationsReceived += amount;
//   await this.save();
// };

// module.exports = mongoose.model('Charity', CharitySchema);
const mongoose = require('mongoose');

const CharitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a charity name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number]
    }
  },
  distance: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 4.5
  },
  reviews: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: ''
  },
  pricePerPlate: {
    type: Number,
    required: [true, 'Please add price per plate'],
    min: [0, 'Price cannot be negative']
  },
  type: {
    type: String,
    enum: ['food', 'money', 'both'],
    required: [true, 'Please specify donation type']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalDonationsReceived: {
    type: Number,
    default: 0
  },
  totalPlatesReceived: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  contactEmail: {
    type: String
  },
  contactPhone: {
    type: String
  }
}, {
  timestamps: true
});

// Only create geospatial index if coordinates exist
CharitySchema.index({ location: '2dsphere' }, { sparse: true });

// Pre-save middleware to set default coordinates if not provided
CharitySchema.pre('save', function(next) {
  // If location is being set but coordinates are missing, add default
  if (this.location && this.location.type === 'Point' && (!this.location.coordinates || this.location.coordinates.length === 0)) {
    // Default to Bangalore coordinates or remove location entirely
    this.location = undefined;
  }
  next();
});

// Update charity stats when donation is made
CharitySchema.methods.updateStats = async function(plates, amount) {
  this.totalPlatesReceived += plates;
  this.totalDonationsReceived += amount;
  await this.save();
};

module.exports = mongoose.model('Charity', CharitySchema);