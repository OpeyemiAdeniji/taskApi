const ErrorResponse = require('../utils/errorResponse.util');
const { asyncHandler, strIncludesEs6, strToArrayEs6 } = require('@nijisog/todo_common');

const Item = require('../models/Item.model');

// @desc    Get all items
// @route   GET /api/todo/v1/items
// access   Public
exports.getItems = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
})
