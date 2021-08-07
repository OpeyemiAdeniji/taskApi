const express = require('express');
 
// routers
const friendRoutes = require('./routers/friend.router');
const itemRoutes = require('./routers/item.router');
const reminderRoutes = require('./routers/reminder.router');
const todoRoutes = require('./routers/todo.router');
 
// create router
const router = express.Router();
 
// define routes
router.use('/friends', friendRoutes);
router.use('/items', itemRoutes);
router.use('/reminders', reminderRoutes);
router.use('/todos', todoRoutes);

// for unmapped routes
router.get('/', (req, res, next) => {
 
   res.status(200).json({
       status: 'success',
       data: {
           name: 'todo-todo-service',
           version: '0.1.0'
       }
   })
  
});
 
module.exports = router;