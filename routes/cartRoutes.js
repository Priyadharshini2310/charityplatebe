const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

const router = express.Router();

const { protect } = require('../middleware/auth');

// All routes are protected (require authentication)
router.use(protect);

router.route('/')
  .get(getCart)           // GET /api/cart - Get user's cart
  .post(addToCart)        // POST /api/cart - Add item to cart
  .delete(clearCart);     // DELETE /api/cart - Clear cart

router.route('/:itemId')
  .put(updateCartItem)    // PUT /api/cart/:itemId - Update cart item
  .delete(removeFromCart); // DELETE /api/cart/:itemId - Remove item from cart

module.exports = router;