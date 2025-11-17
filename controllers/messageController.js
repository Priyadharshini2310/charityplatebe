// const Message = require('../models/Message');
// const Charity = require('../models/Charity');
// const Donation = require('../models/Donation');

// // @desc    Get all messages for a user
// // @route   GET /api/messages
// // @access  Private
// exports.getMessages = async (req, res, next) => {
//   try {
//     const { isRead } = req.query;

//     let query = { user: req.user.id };

//     if (isRead !== undefined) {
//       query.isRead = isRead === 'true';
//     }

//     const messages = await Message.find(query)
//       .populate('charity', 'name image')
//       .populate('donation', 'plates amount donationType')
//       .sort('-createdAt');

//     res.status(200).json({
//       success: true,
//       count: messages.length,
//       data: messages
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       error: err.message
//     });
//   }
// };

// // @desc    Get single message
// // @route   GET /api/messages/:id
// // @access  Private
// exports.getMessage = async (req, res, next) => {
//   try {
//     const message = await Message.findById(req.params.id)
//       .populate('charity', 'name image address')
//       .populate('donation', 'plates amount donationType status');

//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         error: 'Message not found'
//       });
//     }

//     // Make sure user owns message
//     if (message.user.toString() !== req.user.id) {
//       return res.status(401).json({
//         success: false,
//         error: 'Not authorized to access this message'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: message
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       error: err.message
//     });
//   }
// };

// // @desc    Create a single message
// // @route   POST /api/messages
// // @access  Private
// exports.createMessage = async (req, res, next) => {
//   try {
//     const { charityId, donationId, message, points } = req.body;

//     // Validate charity exists
//     const charity = await Charity.findById(charityId);
//     if (!charity) {
//       return res.status(404).json({
//         success: false,
//         error: 'Charity not found'
//       });
//     }

//     // Validate donation exists
//     const donation = await Donation.findById(donationId);
//     if (!donation) {
//       return res.status(404).json({
//         success: false,
//         error: 'Donation not found'
//       });
//     }

//     // Verify donation belongs to the user
//     if (donation.user.toString() !== req.user.id) {
//       return res.status(401).json({
//         success: false,
//         error: 'Not authorized to create message for this donation'
//       });
//     }

//     const newMessage = await Message.create({
//       user: req.user.id,
//       charity: charityId,
//       donation: donationId,
//       message,
//       points: points || 0
//     });

//     const populatedMessage = await Message.findById(newMessage._id)
//       .populate('charity', 'name image')
//       .populate('donation', 'plates amount donationType');

//     res.status(201).json({
//       success: true,
//       data: populatedMessage
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       error: err.message
//     });
//   }
// };

// // @desc    Create multiple messages (bulk)
// // @route   POST /api/messages/bulk
// // @access  Private
// exports.createBulkMessages = async (req, res, next) => {
//   try {
//     const { messages } = req.body;

//     if (!messages || !Array.isArray(messages) || messages.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'Please provide an array of messages'
//       });
//     }

//     const createdMessages = [];
//     const errors = [];

//     for (let i = 0; i < messages.length; i++) {
//       try {
//         const { charityId, donationId, message, points } = messages[i];

//         // Validate charity exists
//         const charity = await Charity.findById(charityId);
//         if (!charity) {
//           errors.push({
//             index: i,
//             error: `Charity not found for message at index ${i}`
//           });
//           continue;
//         }

//         // Validate donation exists
//         const donation = await Donation.findById(donationId);
//         if (!donation) {
//           errors.push({
//             index: i,
//             error: `Donation not found for message at index ${i}`
//           });
//           continue;
//         }

//         // Verify donation belongs to the user
//         if (donation.user.toString() !== req.user.id) {
//           errors.push({
//             index: i,
//             error: `Not authorized to create message for donation at index ${i}`
//           });
//           continue;
//         }

//         const newMessage = await Message.create({
//           user: req.user.id,
//           charity: charityId,
//           donation: donationId,
//           message,
//           points: points || 0
//         });

//         createdMessages.push(newMessage);
//       } catch (error) {
//         errors.push({
//           index: i,
//           error: error.message
//         });
//       }
//     }

//     // Populate all created messages
//     const populatedMessages = await Message.find({
//       _id: { $in: createdMessages.map(m => m._id) }
//     })
//       .populate('charity', 'name image')
//       .populate('donation', 'plates amount donationType');

//     res.status(201).json({
//       success: true,
//       count: createdMessages.length,
//       data: populatedMessages,
//       errors: errors.length > 0 ? errors : undefined
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       error: err.message
//     });
//   }
// };

// // @desc    Mark message as read
// // @route   PUT /api/messages/:id/read
// // @access  Private
// exports.markAsRead = async (req, res, next) => {
//   try {
//     const message = await Message.findById(req.params.id);

//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         error: 'Message not found'
//       });
//     }

//     // Make sure user owns message
//     if (message.user.toString() !== req.user.id) {
//       return res.status(401).json({
//         success: false,
//         error: 'Not authorized to update this message'
//       });
//     }

//     message.isRead = true;
//     await message.save();

//     res.status(200).json({
//       success: true,
//       data: message
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       error: err.message
//     });
//   }
// };

// // @desc    Mark all messages as read
// // @route   PUT /api/messages/read-all
// // @access  Private
// exports.markAllAsRead = async (req, res, next) => {
//   try {
//     const result = await Message.updateMany(
//       { user: req.user.id, isRead: false },
//       { isRead: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: `${result.modifiedCount} messages marked as read`,
//       data: result
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       error: err.message
//     });
//   }
// };

// // @desc    Delete message
// // @route   DELETE /api/messages/:id
// // @access  Private
// // exports.deleteMessage = async (req, res, next) => {
// //   try {
// //     const message = await Message.findById(req.params.id);

// //     if (!message) {
// //       return res.status(404).json({
// //         success: false,
// //         error: 'Message not found'
// //       });
// //     }

// //     // Make sure user owns message
// //     if (message.user.toString() !== req.user.id) {
// //       return res.status(401).json({
// //         success: false,
// //         error: 'Not authorized to delete this message'
// //       });
// //     }

// //     await message.deleteOne();

// //     res.status(200).json({
// //       success: true,
// //       data: {}
// //     });
// //   } catch (err) {
// //     res.status(400).json({
// //       success: false,
// //       error: err.message
// //     });
// //   }
// // };
// // controllers/messageController.js
// exports.deleteMessage = async (req, res) => {
//   try {
//     const message = await Message.findById(req.params.id);

//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         message: 'Message not found'
//       });
//     }

//     // Check if user is authorized to delete
//     // Charity can delete messages they sent
//     // Donor can delete messages they received
//     const isCharity = req.user.role === 'charity' &&
//                       message.charity.toString() === req.user.id;
//     const isDonor = req.user.role === 'donor' &&
//                     message.user.toString() === req.user.id;

//     if (!isCharity && !isDonor) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to delete this message'
//       });
//     }

//     await message.deleteOne();

//     res.status(200).json({
//       success: true,
//       message: 'Message deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete message error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// };
// // @desc    Get all sent messages for a charity
// // @route   GET /api/messages/sent
// // @access  Private (Charity only)
// exports.getSentMessages = async (req, res, next) => {
//   try {
//     // Ensure only charity users can access this route
//     if (req.user.role !== 'charity') {
//       return res.status(403).json({
//         success: false,
//         error: 'Only charities can view sent messages',
//       });
//     }

//     const { isRead } = req.query;

//     // Build query to filter messages sent by this charity
//     let query = { charity: req.user.id };

//     if (isRead !== undefined) {
//       query.isRead = isRead === 'true';
//     }

//     // Find messages and populate relevant fields
//     const messages = await Message.find(query)
//       .populate('user', 'name email') // donor info
//       .populate('donation', 'plates amount donationType')
//       .sort('-createdAt');

//     res.status(200).json({
//       success: true,
//       count: messages.length,
//       data: messages,
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };
const Message = require("../models/Message");
const Charity = require("../models/Charity");
const Donation = require("../models/Donation");
const mongoose = require("mongoose");
// --------------------------------------------------
// 🧍 Donor: Get received messages
// --------------------------------------------------
exports.getMessages = async (req, res) => {
  try {
    const { isRead } = req.query;
    let query = { user: req.user.id };

    if (isRead !== undefined) query.isRead = isRead === "true";

    const messages = await Message.find(query)
      .populate("charity", "name image")
      .populate("donation", "plates amount donationType")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// --------------------------------------------------
// 🏢 Charity: Get sent messages
// --------------------------------------------------
// @desc    Get all messages sent by a charity
// @route   GET /api/messages/sent/:charityId
// @access  Private
exports.getSentMessages = async (req, res) => {
  try {
    const { charityId } = req.params;
    console.log("Fetching sent messages for charity ID:", charityId);

    const messages = await Message.find({
      charity: new mongoose.Types.ObjectId(charityId),
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    console.log(`Found ${messages.length} sent messages`);
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching sent messages:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// --------------------------------------------------
// 📩 Get single message
// --------------------------------------------------
exports.getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate("charity", "name image address")
      .populate("donation", "plates amount donationType status");

    if (!message)
      return res
        .status(404)
        .json({ success: false, error: "Message not found" });

    // Authorization check
    if (
      message.user.toString() !== req.user.id &&
      message.charity.toString() !== req.user.id
    ) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    res.status(200).json({ success: true, data: message });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// --------------------------------------------------
// ✉️ Create a message
// --------------------------------------------------
exports.createMessage = async (req, res) => {
  try {
    const { charityId, donationId, message, points } = req.body;

    const charity = await Charity.findById(charityId);
    if (!charity)
      return res
        .status(404)
        .json({ success: false, error: "Charity not found" });

    const donation = await Donation.findById(donationId);
    if (!donation)
      return res
        .status(404)
        .json({ success: false, error: "Donation not found" });

    if (donation.user.toString() !== req.user.id)
      return res.status(401).json({ success: false, error: "Not authorized" });

    const newMessage = await Message.create({
      user: req.user.id,
      charity: charityId,
      donation: donationId,
      message,
      points: points || 0,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("charity", "name image")
      .populate("donation", "plates amount donationType");

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// --------------------------------------------------
// 📦 Create multiple messages (bulk)
// --------------------------------------------------
exports.createBulkMessages = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0)
      return res
        .status(400)
        .json({ success: false, error: "Invalid message array" });

    const created = [];
    const errors = [];

    for (let i = 0; i < messages.length; i++) {
      try {
        const { charityId, donationId, message, points } = messages[i];

        const charity = await Charity.findById(charityId);
        if (!charity) throw new Error(`Charity not found at index ${i}`);

        const donation = await Donation.findById(donationId);
        if (!donation) throw new Error(`Donation not found at index ${i}`);

        if (donation.user.toString() !== req.user.id)
          throw new Error(`Unauthorized message at index ${i}`);

        const newMsg = await Message.create({
          user: req.user.id,
          charity: charityId,
          donation: donationId,
          message,
          points: points || 0,
        });

        created.push(newMsg);
      } catch (err) {
        errors.push({ index: i, error: err.message });
      }
    }

    const populated = await Message.find({
      _id: { $in: created.map((m) => m._id) },
    })
      .populate("charity", "name image")
      .populate("donation", "plates amount donationType");

    res.status(201).json({
      success: true,
      count: created.length,
      data: populated,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// --------------------------------------------------
// 👁️ Mark as read (single)
// --------------------------------------------------
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message)
      return res
        .status(404)
        .json({ success: false, error: "Message not found" });

    if (message.user.toString() !== req.user.id)
      return res.status(401).json({ success: false, error: "Unauthorized" });

    message.isRead = true;
    await message.save();

    res.status(200).json({ success: true, data: message });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// --------------------------------------------------
// 👁️‍🗨️ Mark all as read
// --------------------------------------------------
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Message.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} messages marked as read`,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// --------------------------------------------------
// 🗑️ Delete message (Charity or Donor)
// --------------------------------------------------
exports.deleteMessage = async (req, res) => {
  try {
    // 1. Find the Message by ID
    const message = await Message.findById(req.params.id);
    if (!message)
      return res
        .status(404)
        .json({ success: false, message: "Message not found" }); // 2. Authorization Check for Charity User

    // Assuming the 'protect' middleware has run and req.user is available

    console.log("Logged-in user role:", req.user.role);
    if (req.user.role === "charity") {
      // A. Find the Charity document associated with the logged-in User ID
      const charityProfile = await Charity.findOne({ userId: req.user.id });

      if (!charityProfile) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Not authorized: Charity profile not found for this user",
          });
      } // B. Compare the message's charity ID with the logged-in user's charity profile ID

      if (message.charity.toString() !== charityProfile._id.toString()) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Not authorized: Message does not belong to your charity",
          });
      }
    }
    // 3. Authorization Check for Donor User (for completeness)
    else if (req.user.role === "donor") {
      if (message.user.toString() !== req.user.id.toString()) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Not authorized: Message does not belong to this donor",
          });
      }
    } else {
      // Fallback for non-donor/non-charity roles
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    } // 4. Delete the message if authorization passes

    await message.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
