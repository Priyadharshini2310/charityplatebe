const express = require('express');
const {
  getDonations,
  getDonation,
  createDonation,
  updateDonationStatus,
  refundCautionDeposit,
  getUserDonations
} = require('../controllers/donationController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getUserDonations)    // GET /api/donations - Get user's donations
  .post(createDonation);    // POST /api/donations - Create donation from cart

router.route('/all')
  .get(authorize('admin', 'charity'), getDonations); // GET /api/donations/all - Get all donations (admin/charity)

router.route('/:id')
  .get(getDonation)         // GET /api/donations/:id - Get single donation
  .put(authorize('admin', 'charity'), updateDonationStatus); // PUT /api/donations/:id - Update donation status

router.route('/:id/refund')
  .post(authorize('admin'), refundCautionDeposit); // POST /api/donations/:id/refund - Refund caution deposit

module.exports = router;