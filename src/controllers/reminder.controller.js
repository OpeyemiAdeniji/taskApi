const ErrorResponse = require('../utils/errorResponse.util');
const { asyncHandler, strIncludesEs6, strToArrayEs6 } = require('@nijisog/todo_common');
const mongoose = require('mongoose');
const moment = require('moment');

const Reminder = require('../models/Reminder.model');
const Todo = require('../models/Todo.model');
const Item = require('../models/Item.model');
const User = require('../models/User.model');
const Friend = require('../models/Friend.model');

// @desc    Get all reminders
// @route   GET /api/todo/v1/reminders
// access   Private
exports.getReminders = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get a reminder
// @route   GET /api/todo/v1/reminders/:id
// access   Private
exports.getReminder = asyncHandler(async (req, res, next) => {
    const reminder = await Reminder.findById(req.params.id).populate([ {path: 'todo' }]);

    if(!reminder){
        return next(new ErrorResponse('Error', 404, ['could not find reminder']))
    }

    res.status(200).json({
        error: false,
        errors: true,
        data: reminder,
        message: 'successful', 
        status: 200
    })
})

// @desc    Create a reminder
// @route   POST /api/todo/v1/reminders
// access   Private
exports.createReminder = asyncHandler(async (req, res, next) => {
    const { dueDate, dueTime, isEnabled, todo, item } = req.body;

    if(!todo && !mongoose.Types.ObjectId.isValid(todo)){
        return next(new ErrorResponse('Error', 400, ['todo id is required to be a valid ObjectId'])) 
    }
    if(!item && !mongoose.Types.ObjectId.isValid(item)){
        return next(new ErrorResponse('Error', 400, ['todo id is required to be a valid ObjectId']))
    }

    if(!strIncludesEs6(dueDate, '-')){ 
        return next(new ErrorResponse('invalid format', 400, ['dueDate is required in the format YYYY-MM-DD']))
    }

    if(dueDate.split('-')[0].length !== 4 && dueDate.split('-')[1].length !== 2 && dueDate.split('-')[2].length !== 2 ){
        return next(new ErrorResponse('invalid format', 400, ['dueDate is required in the format YYYY-MM-DD']))

    }

    if(!strIncludesEs6(dueTime, ':')){
        return next(new ErrorResponse('invalid format', 400, ['dueTime is required in the format 00:00:00'])) 
    }

    if(dueTime.split(':')[0].length !== 2 && dueTime.split(':')[1].length !== 2 && dueTime.split(':')[2].length !== 2){
        return next(new ErrorResponse('invalid format', 400, ['dueTime is required in the format 00:00:00']))
    }

    const _todo = await Todo.findById(todo);

    if(!_todo){
        return next(new ErrorResponse('Error', 404, ['could not find todo']))
    }

    const _item = await Item.findById(item);

    if(!_item){
        return next(new ErrorResponse('Error', 404, ['could not find item']))
    }

    if(_todo.items.length <= 0){
        return next(new ErrorResponse('Error!', 103, ['todo does not have a list of item yet']))
    }

    const reminder = await Reminder.create({
        dueDate: moment(dueDate),
        dueTime: dueTime,
        isEnabled: isEnabled ? isEnabled : false,
        todo: _todo._id,
        item: _item._id,
        user: _todo.user
    });

    res.status(200).json({
        error: false,
        errors: [],
        data: reminder,
        message: 'successful',
        status: 200
    })
})
 