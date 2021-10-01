const ErrorResponse = require('../utils/errorResponse.util');
const { asyncHandler, strIncludesEs6, strToArrayEs6 } = require('@nijisog/todo_common');
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat)

const Worker = require('../jobs/worker');
const itemJob = require('../jobs/item.job');

const Todo = require('../models/Todo.model')
const Item = require('../models/Item.model');
const User = require('../models/User.model');

const nats = require('../events/nats');
const ItemCompleted = require('../events/publishers/item-completed');

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
    const { title, dueDate, dueTime, description, todo } = req.body;

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

    if(!strIncludesEs6(dueTime, ':')){
        return next(new ErrorResponse('invalid format', 400, ['dueTime is required in the format 00:00:00']))
    }


   if(!strIncludesEs6(dueTime, ':')){
    return next(new ErrorResponse('invalid format', 400, ['dueTime is required in the format \'hh:mm:ss\' ']))

   }

    const _todo = await Todo.findById(todo);

    if(!_todo){
        return next(new ErrorResponse('Error!', 404, ['could not find todo']));
    }

    const tsp = dueTime.split(':');
    const hr = tsp[0];
    const min = tsp[1]
    const sec = tsp[2]

    const tsd = dueDate.split('-');
    const year = tsd[0];
    const month = tsd[1];
    const day = tsd[2];

    const tDateTime = dayjs(_todo.dueDate + ' ' + _todo.dueTime);
    const fullDue = dayjs(year + '-' + month + '-' + day + ' ' + hr + ':' + min + ':' + sec);

    // check against date
    if(fullDue.get('date') < tDateTime.get('date') || fullDue.get('date') > tDateTime.get('date')){
        return next(new ErrorResponse('Forbidden!', 403, ['item dueDate cannot be lesser than or greater than todo dueDate']));
    }

    // check against time
    if(fullDue.get('hour') > tDateTime.get('hour')){
        return next(new ErrorResponse('Forbidden!', 403, ['item dueTime cannot be greater than or equal to item dueTime']));
    }

    const user = await User.findById(req.query.user_id)

    if(!user){
        return next(new ErrorResponse('Error!', 404, ['user does not exist']));
    }

    if(user._id.toString() !== _todo.user.toString()){
        return next(new ErrorResponse('Error!', 403, ['todo does not belong to user']));
    }

    const item = await Item.create({
        title: title,
        dueDate: dueDate,
        dueTime: dueTime,
        description: description,
        todo: _todo._id 
    })

    _todo.items.push(item._id);
    await _todo.save();

    const nud = `${parseInt(fullDue.get('minute') - 5 )} ${fullDue.get('hour')} ${fullDue.get('date')} ${fullDue.get('month') + 1} *`;
    const nudCom = `${parseInt(fullDue.get('minute') + 5 )} ${fullDue.get('hour')} ${fullDue.get('date')} ${fullDue.get('month') + 1} *`;

    if(item){
        const worker = new Worker(nud);
        await worker.schedule(() => {
            itemJob.nudgeItem(item._id, user._id);
        })

        const workerCom = new Worker(nudCom);
        await workerCom.schedule(() => {
            itemJob.nudgeItem(item._id);
        })
    }

    res.status(200).json({
        error: false,
        errors: [],
        data: item,
        message: 'successful',
        status: 200
    })
})

// @desc    Mark item completed
// @route   PUT /api/todo/v1/items/:id
// access   Private
exports.completeItem = asyncHandler(async (req, res, next) => {
    const item = await Item.findById(req.params.id);

    if(!item){
        return next(new ErrorResponse('Error!', 404, ['cannot find item']));
    }

    if(item.isDue && item.status === 'abandoned'){
        return next(new ErrorResponse('Error!', 403, ['item is already abandoned and passed due date']));
    }

    item.status = 'completed';
    item.isDue = true;
    await item.save();

    const _item = await Item.findById(item._id).populate([ { path: 'todo' } ])

    const todo = await Todo.findById(item.todo);
    await new ItemCompleted(nats.client).publish({ item: _item, todo:todo });
    
    res.status(200).json({
        error: false,
        errors: [],
        data: item,
        message: 'successful',
        status: 200
    })
})
