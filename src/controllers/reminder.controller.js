const ErrorResponse = require('../utils/errorResponse.util');
const { asyncHandler, strIncludesEs6, strToArrayEs6 } = require('@nijisog/todo_common');

const Reminder = require('../models/Reminder.model');

// @desc    Get all reminders
// @route   GET /api/todo/v1/reminders
// access   Public
exports.getReminders = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
})
