const express = require('express');
const asyncify = require('express-asyncify'); 

const {
   getTodos,
} = require('../../../controllers/todo.controller');

const Todo = require('../../../models/Todo.model');

const advancedResults = require('../../../middleware/advanced.mw');

// router
const router = express.Router({ mergeParams: true });
 
router.get('/', advancedResults(Todo), getTodos);
 
module.exports = router;