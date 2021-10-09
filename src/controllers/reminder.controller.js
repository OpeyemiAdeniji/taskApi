const ErrorResponse = require('../utils/errorResponse.util');
const { asyncHandler, strIncludesEs6, strToArrayEs6 } = require('@nijisog/todo_common');
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat)

const Worker = require('../jobs/worker');
const reminderJob = require('../jobs/reminder.job');

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

    const tsp = dueTime.split(':');
    const hr = tsp[0];
    const min = tsp[1]
    const sec = tsp[2]

    const tsd = dueDate.split('-');
    const year = tsd[0];
    const month = tsd[1];
    const day = tsd[2];

    const iDateTime = dayjs(_item.dueDate + ' ' + _item.dueTime);
    const fullDue = dayjs(year + '-' + month + '-' + day + ' ' + hr + ':' + min + ':' + sec);

    const now = dayjs();
    
    if(_item.reminder !== undefined){

        const _rem = await Reminder.findById(_item.reminder);
        const rDateTime = dayjs(_rem.dueDate + ' ' +  _rem.dueTime);

        if(rDateTime.get('date') > now.get('date')){
            return next(new ErrorResponse('Error!', 500, ['reminder already exist for the selected item']));
        }

        // TODO: check time difference if reminder date is equal to current date
    }

    if(fullDue.get('date') > iDateTime.get('date')){
        return next(new ErrorResponse('Forbidden!', 403, ['reminder dueDate cannot be lesser than item dueDate']));
    }

    if(fullDue.get('hour') > iDateTime.get('hour')){
        return next(new ErrorResponse('Forbidden!', 403, ['reminder dueTime cannot be greater than item dueTime']));
    }

    if(fullDue.get('minute') > iDateTime.get('minute')){
        return next(new ErrorResponse('Forbidden!', 403, ['reminder dueTime cannot be greater than item dueTime']));
    }

    const reminder = await Reminder.create({
        dueDate: dueDate,
        dueTime: dueTime,
        isEnabled: isEnabled ? isEnabled : false,
        todo: _todo._id,
        item: _item._id,
        user: _todo.user
    });

    // attach reminder to item
    _item.reminder = reminder._id;
    await _item.save();

    const rdt = dayjs(reminder.dueDate + ' ' + reminder.dueTime);
    const scd = `${parseInt(rdt.get('minute') - 5)} ${rdt.get('hour')} ${rdt.get('date')} ${rdt.get('month') + 1} *`;
    const scdCom = `${parseInt(rdt.get('minute'))} ${rdt.get('hour')} ${rdt.get('date')} ${rdt.get('month') + 1} *`;
    
    if(reminder){

        const worker = new Worker(scd);

        await worker.schedule(() => {
            reminderJob.remindItem(reminder._id, _todo.user, _item._id)
        });

        const workerCom = new Worker(scdCom);

        await workerCom.schedule(() => {
            reminderJob.completeRem(reminder._id, _todo.user, _item._id)
        })
    }

    res.status(200).json({
        error: false,
        errors: [],
        data: reminder,
        message: 'successful',
        status: 200
    })
})

// @desc    Enable reminder
// @route   PUT /api/todo/v1/reminders/:id
// access   Private
exports.enableReminder = asyncHandler(async (req, res, next) => {

    const reminder = await Reminder.findById(req.params.id);

    if(!reminder){
        return next(new ErrorResponse('Not found!', 404, ['cannot find reminder']));
    }

    reminder.isEnabled = true;
    await reminder.save();

    res.status(200).json({
        error: false,
        errors: [],
        data: null,
        message: 'successful',
        status: 200
    })
})

// @desc    Disable reminder
// @route   PUT /api/todo/v1/reminders/disable/:id
// access   Private
exports.disableReminder = asyncHandler(async (req, res, next) => {

    const reminder = await Reminder.findById(req.params.id);

    if(!reminder){
        return next(new ErrorResponse('Not found!', 404, ['cannot find reminder']));
    }

    reminder.isEnabled = false;
    await reminder.save();

    res.status(200).json({
        error: false,
        errors: [],
        data: null,
        message: 'successful',
        status: 200
    })
})
