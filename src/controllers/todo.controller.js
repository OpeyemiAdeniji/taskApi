const ErrorResponse = require('../utils/errorResponse.util');
const { asyncHandler, strIncludesEs6, strToArrayEs6, strIncludes } = require('@nijisog/todo_common');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat)

const Worker = require('../jobs/worker');
const todoJob = require('../jobs/todo.job');

const Todo = require('../models/Todo.model');
const Item = require('../models/Item.model');
const Reminder = require('../models/Reminder.model');
const User = require('../models/User.model');

const nats = require('../events/nats');
const TodoCompleted = require('../events/publishers/todo-completed');

// @desc    Get all todos
// @route   GET /api/todo/v1/todos
// access   Private
exports.getTodos = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get user todos
// @route   GET /api/todo/v1/todos/:id
// access   Private
exports.getUserTodos = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorResponse('Not Found!', 404, ['could not find user']));
    }

    const todos = await Todo.find({}).where('user').equals(user._id);

    res.status(200).json({
        error: false,
        errors: [],
        data: todos,
        total: todos.length,
        message: 'successful',
        status: 200
    })
})

// @desc    Get a todo
// @route   GET /api/todo/v1/todos/:id
// access   Private
exports.getTodo = asyncHandler(async (req, res, next) => {
    const todo = await Todo.findById(req.params.id).populate([ { path: 'items'} ]);

    if(!todo){
        return next(new ErrorResponse('Error!', 404, ['could not found todo']))
    }

    res.status(200).json({
        error: false,
        errors: [],
        data: todo,
        message: 'successful',
        status: 200
    })

})

// @desc    Create a todo
// @route   POST /api/todo/v1/todos?user_id
// access   Private
exports.createTodo = asyncHandler(async (req, res, next) => {

    const { title, dueDate, dueTime } = req.body;
    const { user_id } = req.query;

    if(!user_id){
        return next(new ErrorResponse('Error!', 400, ['user_id is required as a url parameter']))
    }

    if(!dueDate){
        return next(new ErrorResponse('Error!', 400, ['dueDate is required']))
    }

    if(!dueTime){
        return next(new ErrorResponse('Error!', 400, ['dueTime is required']))
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


   if(!strIncludesEs6(dueTime, ':')){
    return next(new ErrorResponse('invalid format', 400, ['dueTime is required in the format \'hh:mm:ss\' ']))

   }

   const tsp = dueTime.split(':');
   const hr = tsp[0];
   const min = tsp[1]
   const sec = tsp[2]
   const mer = parseInt (hr) >= 12 ? 'PM' : 'AM'

   const tsd = dueDate.split('-');
   const year = tsd[0];
   const month = tsd[1];
   const day = tsd[2];

   if(!year || year.length !== 4){
       return next(new ErrorResponse('Error!', 400, ['year is required to be 4 digits']));
   }

   if(!month || month.length !== 2){
     return next(new ErrorResponse('Error!', 400, ['month is required to be 2 digits']));
   }

   if(!day || day.length !== 2){
    return next(new ErrorResponse('Error!', 400, ['day is required to be 2 digits']));
  }

  if(!hr || hr.length !== 2){
    return next(new ErrorResponse('Error!', 400, ['hr is required to be 2 digits']));
  }

  if(!min || min.length !== 2){
    return next(new ErrorResponse('Error!', 400, ['min is required to be 2 digits']));
  } 

  if(!sec || sec.length !== 2){
    return next(new ErrorResponse('Error!', 400, ['sec is required to be 2 digits']));
  }

  const now = dayjs();

  const fullDue = dayjs(year + '-' + month + '-' + day + ' ' + hr + ':' + min + ':' + sec);

  if(fullDue.get('date') < now.get('date')){
      return next(new ErrorResponse('forbidden!', 403, ['dueDate cannot be a past date']));
  }

    const user = await User.findOne({ userId: user_id })

    if(!user){
        return next(new ErrorResponse('Error!', 404, ['user does not exist']))
    }

    const todo = await Todo.create({
        title: title,
        dueDate: dueDate,
        dueTime: dueTime,
        user: user._id
    });

    user.todos.push(todo._id);
    await user.save();

    const tud = `${parseInt(fullDue.get('minute') + 3 )} ${fullDue.get('hour')} ${fullDue.get('date')} ${fullDue.get('month') + 1} *`;

    if(todo){

        const worker = new Worker(tud);
        await worker.schedule(()  => {
            todoJob.completeTodo(todo._id);
        })
    }

    res.status(200).json({
        error: false,
        errors: [],
        data: todo,
        message: 'successful',
        status: 200
    })
})

// @desc    Mark todo completed
// @route   PUT /api/todo/v1/todos/:id
// access   Private
exports.completeTodo = asyncHandler(async (req, res, next) => {
    const todo = await Item.findById(req.params.id);

    if(!todo){
        return next(new ErrorResponse('Error!', 404, ['cannot find item']));
    }

    if(todo.status === 'done'){
        return next(new ErrorResponse('Error!', 403, ['todo is already done']));
    }

    todo.status = 'done';
    await todo.save();

    await new TodoCompleted(nats.client).publish(todo);
    
    res.status(200).json({
        error: false,
        errors: [],
        data: todo,
        message: 'successful',
        status: 200
    })
})
