const express = require('express');
const asyncify = require('express-asyncify'); 

const {
   getTodos,
   getTodo,
   getUserTodos,
   createTodo,
   deleteTodo
} = require('../../../controllers/todo.controller');

const Todo = require('../../../models/Todo.model');

const advancedResults = require('../../../middleware/advanced.mw');

// router
const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../../../middleware/auth.mw');

const roles = ['superadmin', 'admin'];
const allRoles = ['superadmin', 'admin', 'user'];

 
router.get('/', protect, authorize(allRoles), advancedResults(Todo), getTodos);
router.get('/:id', protect, authorize(allRoles), getTodo);
router.get('/user/:id', protect, authorize(allRoles), getUserTodos);
router.post('/', protect, authorize(allRoles), createTodo);
router.delete('/', protect, authorize(allRoles), deleteTodo);
 
module.exports = router;