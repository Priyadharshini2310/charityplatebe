// const Cart = require('../models/Cart');
// const Charity = require('../models/Charity');

// const CAUTION_DEPOSIT_PER_PLATE = 20;

// // @desc    Get user's cart
// // @route   GET /api/cart
// // @access  Private
// exports.getCart = async (req, res, next) => {
//   try {
//     let cart = await Cart.findOne({ user: req.user.id }).populate('items.charity');
    
//     if (!cart) {
//       cart = await Cart.create({
//         user: req.user.id,
//         items: []
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       data: cart
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       error: err.message
//     });
//   }
// };

// // @desc    Add item to cart
// // @route   POST /api/cart
// // @access  Private
// exports.addToCart = async (req, res, next) => {
//   try {
//     const { charityId, plates, donationType } = req.body;
    
//     // Validate charity exists
//     const charity = await Charity.findById(charityId);
//     if (!charity) {
//       return res.status(404).json({
//         success: false,
//         error: 'Charity not found'
//       });
//     }
    
//     // Validate donation type
//     if (charity.type !== 'both' && charity.type !== donationType) {
//       return res.status(400).json({
//         success: false,
//         error: `This charity only accepts ${charity.type} donations`
//       });
//     }
    
//     // Calculate amounts
//     const amount = plates * charity.pricePerPlate;
//     const cautionDeposit = donationType === 'food' ? plates * CAUTION_DEPOSIT_PER_PLATE : 0;
    
//     let cart = await Cart.findOne({ user: req.user.id });
    
//     if (!cart) {
//       cart = await Cart.create({
//         user: req.user.id,
//         items: []
//       });
//     }
    
//     // Check if item already exists
//     const existingItemIndex = cart.items.findIndex(
//       item => item.charity.toString() === charityId && item.donationType === donationType
//     );
    
//     if (existingItemIndex > -1) {
//       // Update existing item
//       cart.items[existingItemIndex].plates += plates;
//       cart.items[existingItemIndex].amount += amount;
//       cart.items[existingItemIndex].cautionDeposit += cautionDeposit;
//     } else {
//       // Add new item
//       cart.items.push({
//         charity: charityId,
//         plates,
//         donationType,
//         amount,
//         cautionDeposit
//       });
//     }
    
//     await cart.save();
//     cart = await Cart.findById(cart._id).populate('items.charity');
    
//     res.status(200).json({
//       success: true,
//       data: cart
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       error: err.message
//     });
//   }
// };

// // @desc    Update cart item
// // @route   PUT /api/cart/:itemId
// // @access  Private
// exports.updateCartItem = async (req, res, next) => {
//   try {
//     const { plates } = req.body;
    
//     const cart = await Cart.findOne({ user: req.user.id });
    
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         error: 'Cart not found'
//       });
//     }
    
//     const itemIndex = cart.items.findIndex(
//       item => item._id.toString() === req.params.itemId
//     );
    
//     if (itemIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         error: 'Item not found in cart'
//       });
//     }
    
//     const item = cart.items[itemIndex];
//     const charity = await Charity.findById(item.charity);
    
//     // Recalculate amounts
//     item.plates = plates;
//     item.amount = plates * charity.pricePerPlate;
//     item.cautionDeposit = item.donationType === 'food' ? plates * CAUTION_DEPOSIT_PER_PLATE : 0;
    
//     await cart.save();
//     await cart.populate('items.charity');
    
//     res.status(200).json({
//       success: true,
//       data: cart
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       error: err.message
//     });
//   }
// };

// // @desc    Remove item from cart
// // @route   DELETE /api/cart/:itemId
// // @access  Private
// exports.removeFromCart = async (req, res, next) => {
//   try {
//     const cart = await Cart.findOne({ user: req.user.id });
    
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         error: 'Cart not found'
//       });
//     }
    
//     cart.items = cart.items.filter(
//       item => item._id.toString() !== req.params.itemId
//     );
    
//     await cart.save();
//     await cart.populate('items.charity');
    
//     res.status(200).json({
//       success: true,
//       data: cart
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       error: err.message
//     });
//   }
// };

// // @desc    Clear cart
// // @route   DELETE /api/cart
// // @access  Private
// exports.clearCart = async (req, res, next) => {
//   try {
//     const cart = await Cart.findOne({ user: req.user.id });
    
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         error: 'Cart not found'
//       });
//     }
    
//     cart.items = [];
//     await cart.save();
    
//     res.status(200).json({
//       success: true,
//       data: cart
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       error: err.message
//     });
//   }
// };
const Cart = require('../models/Cart');
const Charity = require('../models/Charity');

const CAUTION_DEPOSIT_PER_PLATE = 20;

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.charity');
    
    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: []
      });
    }
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { charityId, plates, donationType } = req.body;
    
    // Validate charity exists
    const charity = await Charity.findById(charityId);
    if (!charity) {
      return res.status(404).json({
        success: false,
        error: 'Charity not found'
      });
    }
    
    // Validate donation type
    if (charity.type !== 'both' && charity.type !== donationType) {
      return res.status(400).json({
        success: false,
        error: `This charity only accepts ${charity.type} donations`
      });
    }
    
    // Calculate amounts
    const amount = plates * charity.pricePerPlate;
    const cautionDeposit = donationType === 'food' ? plates * CAUTION_DEPOSIT_PER_PLATE : 0;
    
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: []
      });
    }
    
    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item => item.charity.toString() === charityId && item.donationType === donationType
    );
    
    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].plates += plates;
      cart.items[existingItemIndex].amount += amount;
      cart.items[existingItemIndex].cautionDeposit += cautionDeposit;
      cart.items[existingItemIndex].pricePerPlate = charity.pricePerPlate;
      cart.items[existingItemIndex].charityName = charity.name;
    } else {
      // Add new item
      cart.items.push({
        charity: charityId,
        plates,
        donationType,
        amount,
        cautionDeposit,
        pricePerPlate: charity.pricePerPlate,
        charityName: charity.name
      });
    }
    
    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.charity');
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update cart item
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { plates } = req.body;
    
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === req.params.itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      });
    }
    
    const item = cart.items[itemIndex];
    const charity = await Charity.findById(item.charity);
    
    // Recalculate amounts
    item.plates = plates;
    item.amount = plates * charity.pricePerPlate;
    item.cautionDeposit = item.donationType === 'food' ? plates * CAUTION_DEPOSIT_PER_PLATE : 0;
    item.pricePerPlate = charity.pricePerPlate;
    item.charityName = charity.name;
    
    await cart.save();
    await cart.populate('items.charity');
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }
    
    cart.items = cart.items.filter(
      item => item._id.toString() !== req.params.itemId
    );
    
    await cart.save();
    await cart.populate('items.charity');
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }
    
    cart.items = [];
    await cart.save();
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};