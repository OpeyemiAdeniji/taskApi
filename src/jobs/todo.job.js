const User = require('../models/User.model');
const Todo = require('../models/Todo.model');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const nats = require('../events/nats');
const TodoCompleted = require('../events/publishers/todo-completed');

const { sendGrid } = require('../utils/email.util');

const completeTodo = async (todoId) => {
    console.log('started running todo.job to mark todo done');

    const todo = await Todo.findById(todoId);

    if(todo && todo.status === 'pending'){
        todo.status = 'done';
        await Todo.save();

        await new TodoCompleted(nats.client).publish(todo);
    }
                
}

module.exports = { completeTodo }