const express = require('express');
const asyncify = require('express-asyncify'); 

const {
   getReminders, 
   getReminder,
   createReminder,
   enableReminder,
   disableReminder
} = require('../../../controllers/reminder.controller');

const Reminder = require('../../../models/Reminder.model');

const advancedResults = require('../../../middleware/advanced.mw');

// router
const router = express.Router({ mergeParams: true });
 
const { protect, authorize } = require('../../../middleware/auth.mw');

const roles = ['superadmin', 'admin'];
const allRoles = ['superadmin', 'admin', 'user'];

 
router.get('/', protect, authorize(allRoles), advancedResults(Reminder), getReminders);
router.get('/:id', protect, authorize(allRoles), getReminder);
router.post('/', protect, authorize(allRoles), createReminder);
router.put('/:id', protect, authorize(allRoles), enableReminder);
router.put('/disable/:id', protect, authorize(allRoles), disableReminder);
 
module.exports = router;