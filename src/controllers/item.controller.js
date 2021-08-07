const ErrorResponse = require('../utils/errorResponse.util');
const { asyncHandler, strIncludesEs6, strToArrayEs6 } = require('@nijisog/todo_common');
const moment = require('moment');
const mongoose = require('mongoose');

const Todo = require('../models/Todo.model')
const Item = require('../models/Item.model');
const Reminder = require('../models/Reminder.model');
const Friend = require('../models/Friend.model');

// @desc    Get all items
// @route   GET /api/todo/v1/items
// access   Private
exports.getItems = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
})

// @desc    Get a item
// @route   GET /api/todo/v1/items/:id
// access   Private
exports.getItem = asyncHandler(async (req, res, next) => {
    const item = await Item.findById(req.params.id).populate([ {path: 'friends'}, {path: 'reminder'}, {path: 'todo'}]);

    if(!item){
        return next(new ErrorResponse('Error!', 404, ['could not find item']))
    }

    res.status(200).json({
        error: false,
        errors: [],
        data: item,
        message: 'successful',
        status: 200
    })
})


// @desc    Create an item
// @route   GET /api/todo/v1/items?user_id
// access   Private
exports.createItem = asyncHandler(async (req, res, next) => {
    const { title, dueDate, description, todo } = req.body;

    if(!req.query.user_id){
        return next(new ErrorResponse('Error!', 400, ['user_id is required to be a url parameter']));
    }

    if(!todo && !mongoose.Types.ObjectId.isValid(todo)){
        return next(new ErrorResponse('Error', 400, ['todo id is required to be a valid ObjectId']));
    }

    if(!strIncludesEs6(dueDate, '-')){
        return next(new ErrorResponse('invalid format', 400, ['dueDate is required in the format YYYY-MM-DD']));
    }

    if(dueDate.split('-')[0].length !== 4 && dueDate.split('-')[1].length !== 2 && dueDate.split('-')[2].length !== 2 ){
        return next(new ErrorResponse('invalid format', 400, ['dueDate is required in the format YYYY-MM-DD']));

    }

    const _todo = await Todo.findById(todo);

    if(!_todo){
        return next(new ErrorResponse('Error!', 404, ['could not find todo']));
    }

    const user = await User.findById(req.query.user_id)

    if(!user){
        return next(new ErrorResponse('Error!', 404, ['user does not exist']));
    }

    if(user._id !== _todo.user){
        return next(new ErrorResponse('Error!', 403, ['todo does not belong to user']));
    }

    const item = await Item.create({
        title: title,
        dueDate: moment(dueDate),
        description: description,
        todo: _todo._id 
    })

    _todo.items.push(item._id);
    await _todo.save();

    res.status(200).json({
        error: false,
        errors: [],
        data: item,
        message: 'successful',
        status: 200
    })
})