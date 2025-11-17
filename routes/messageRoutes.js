
// // const express = require('express');
// // const {
// //   getMessages,
// //   getMessage,
// //   createMessage,
// //   createBulkMessages,
// //   markAsRead,
// //   markAllAsRead,
// //   deleteMessage
// // } = require('../controllers/messageController');

// // const router = express.Router();

// // const { protect } = require('../middleware/auth');

// // // All routes require authentication
// // router.use(protect);

// // // Base route - Get all messages and Create single message
// // router.route('/')
// //   .get(getMessages)           // GET /api/messages - Get user's messages (with optional ?isRead=true/false)
// //   .post(createMessage);       // POST /api/messages - Create a single message

// // // Bulk create messages
// // router.route('/bulk')
// //   .post(createBulkMessages);  // POST /api/messages/bulk - Create multiple messages

// // // Mark all messages as read
// // router.route('/read-all')
// //   .put(markAllAsRead);        // PUT /api/messages/read-all - Mark all user's messages as read

// // // Single message operations
// // router.route('/:id')
// //   .get(getMessage)            // GET /api/messages/:id - Get single message
// //   .delete(deleteMessage);     // DELETE /api/messages/:id - Delete message

// // // Mark single message as read
// // router.route('/:id/read')
// //   .put(markAsRead);           // PUT /api/messages/:id/read - Mark message as read

// // module.exports = router;
// const express = require('express');
// const {
//   getMessages,
//   getSentMessages,   // ✅ newly added
//   getMessage,
//   createMessage,
//   createBulkMessages,
//   markAsRead,
//   markAllAsRead,
//   deleteMessage
// } = require('../controllers/messageController');

// const router = express.Router();
// const { protect } = require('../middleware/auth');

// // All routes require authentication
// router.use(protect);

// // --------------------------------------------
// // 💬 Donor-side routes
// // --------------------------------------------

// // Base route - Get all messages and Create single message
// router.route('/')
//   .get(getMessages)           // GET /api/messages - Get user's messages (with optional ?isRead=true/false)
//   .post(createMessage);       // POST /api/messages - Create a single message

// // Bulk create messages
// router.route('/bulk')
//   .post(createBulkMessages);  // POST /api/messages/bulk - Create multiple messages

// // Mark all messages as read
// router.route('/read-all')
//   .put(markAllAsRead);        // PUT /api/messages/read-all - Mark all user's messages as read

// // Mark single message as read
// router.route('/:id/read')
//   .put(markAsRead);           // PUT /api/messages/:id/read - Mark message as read

// // Single message operations
// router.route('/:id')
//   .get(getMessage)            // GET /api/messages/:id - Get single message
//   .delete(deleteMessage);     // DELETE /api/messages/:id - Delete message


// // --------------------------------------------
// // 🏢 Charity-side route (Sent messages)
// // --------------------------------------------
// router.route('/sent')
//   .get(getSentMessages);      // GET /api/messages/sent - Get all messages sent by the charity


// module.exports = router;
const express = require('express');
const {
  getMessages,        // Donor - received messages
  getSentMessages,    // Charity - sent messages
  getMessage,
  createMessage,
  createBulkMessages,
  markAsRead,
  markAllAsRead,
  deleteMessage
} = require('../controllers/messageController');

const { protect } = require('../middleware/auth');
const router = express.Router();

// 🔒 All routes require authentication
router.use(protect);

// --------------------------------------------------
// 💌 Donor routes - Get and create messages
// --------------------------------------------------
router.route('/')
  .get(getMessages)            // GET /api/messages - donor received messages
  .post(createMessage);        // POST /api/messages - donor creates message

// Bulk create messages
router.post('/bulk', createBulkMessages);

// Mark all messages as read
router.put('/read-all', markAllAsRead);

// --------------------------------------------------
// 🏢 Charity routes - Sent messages
// --------------------------------------------------

router.route('/sent/:charityId').get(getSentMessages);

// --------------------------------------------------
// 📩 Individual message routes
// --------------------------------------------------
router.put('/:id/read', markAsRead);  // PUT /api/messages/:id/read
router.route('/:id')
  .get(getMessage)                   // GET /api/messages/:id
  .delete(deleteMessage);            // DELETE /api/messages/:id

module.exports = router;
