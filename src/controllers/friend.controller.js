const ErrorResponse = require('../utils/errorResponse.util');
const { asyncHandler, strIncludesEs6, strToArrayEs6 } = require('@nijisog/todo_common');

const Friend = require('../models/Friend.model');

// @desc    Get all friends
// @route   GET /api/todo/v1/friends
// access   Public
exports.getFriends = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
})
