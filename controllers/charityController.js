const Charity = require('../models/Charity');
exports.getCharities = async (req, res, next) => {
  try {
    const { type, sortBy } = req.query;
    
    let query = { isActive: true };
    
    // Filter by type
    if (type && type !== 'all') {
      if (type === 'both') {
        query.type = 'both';
      } else {
        query.$or = [{ type: type }, { type: 'both' }];
      }
    }
    
    let charities = Charity.find(query);
    
    // Sorting
    if (sortBy === 'distance') {
      charities = charities.sort({ distance: 1 });
    } else if (sortBy === 'rating') {
      charities = charities.sort({ rating: -1 });
    } else if (sortBy === 'price') {
      charities = charities.sort({ pricePerPlate: 1 });
    }
    
    charities = await charities;
    
    res.status(200).json({
      success: true,
      count: charities.length,
      data: charities
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single charity
// @route   GET /api/charity/:id
// @access  Public
exports.getCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findById(req.params.id);
    
    if (!charity) {
      return res.status(404).json({
        success: false,
        error: 'Charity not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: charity
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Create new charity
// @route   POST /api/charity
exports.createCharity = async (req, res, next) => {
  try {
    const charity = await Charity.create(req.body);
    
    res.status(201).json({
      success: true,
      data: charity
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update charity
// @route   PUT /api/charity/:id
exports.updateCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    console.log('charity',req.body);
    console.log('Updated Charity:', charity);
    if (!charity) {
      return res.status(404).json({
        success: false,
        error: 'Charity not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: charity
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete charity
// @route   DELETE /api/charity/:id
exports.deleteCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findByIdAndDelete(req.params.id);
    
    if (!charity) {
      return res.status(404).json({
        success: false,
        error: 'Charity not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get charities within a radius
// @route   GET /api/charity/radius/:zipcode/:distance
// @access  Public
exports.getCharitiesInRadius = async (req, res, next) => {
  try {
    const { zipcode, distance } = req.params;
    
    // Get lat/lng from geocoder (you'll need to implement this)
    // For now, using dummy coordinates for Bangalore
    const lat = 12.9716;
    const lng = 77.5946;
    
    // Calc radius using radians
    // Divide distance by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = distance / 6378;
    
    const charities = await Charity.find({
      location: {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius]
        }
      },
      isActive: true
    });
    
    res.status(200).json({
      success: true,
      count: charities.length,
      data: charities
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
// @desc    Create multiple charities (bulk)
// @route   POST /api/charity/bulk
exports.createCharitiesBulk = async (req, res, next) => {
  try {
    console.log('========== DEBUG ==========');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Is Array?:', Array.isArray(req.body));
    console.log('Body length:', req.body.length);
    console.log('First item:', req.body[0]);
    console.log('===========================');
    
    const charities = await Charity.insertMany(req.body);
    
    res.status(201).json({
      success: true,
      count: charities.length,
      data: charities
    });
  } catch (err) {
    console.log('ERROR:', err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
// @desc    Get charity by userId
// @route   GET /api/charity/byUser/:userId
// @desc    Get charity by user ID
// @route   GET /api/charity/byUser/:userId
// @access  Private
// @desc    Get charity by user ID
// @route   GET /api/charity/byUser/:userId
// @access  Private
exports.getCharityByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // 👇 CHANGE 'user' to 'userId' to match the Charity model's field
    const charity = await Charity.findOne({ userId: userId });

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: 'Charity not found for this user'
      });
    }

    res.status(200).json({
      success: true,
      data: charity
    });
  } catch (error) {
    console.error('Error fetching charity by user:', error);
    // ... (rest of error handling)
  }
};
