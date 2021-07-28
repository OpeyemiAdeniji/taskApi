const ErrorResponse = require('../utils/errorResponse.util');
const { asyncHandler, strIncludesEs6, strToArrayEs6 } = require('@nijisog/todo_common');

const Todo = require('../models/Todo.model');

// @desc    Get all todos
// @route   GET /api/todo/v1/todo
// access   Public
exports.getTodos = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
})
