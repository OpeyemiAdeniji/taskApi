const express = require('express');
const asyncify = require('express-asyncify'); 

const {
   getReminders,
} = require('../../../controllers/reminder.controller');

const Reminder = require('../../../models/Reminder.model');

const advancedResults = require('../../../middleware/advanced.mw');

// router
const router = express.Router({ mergeParams: true });
 
router.get('/', advancedResults(Reminder), getReminders);
 
module.exports = router;