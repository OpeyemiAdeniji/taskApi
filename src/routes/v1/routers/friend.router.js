const express = require('express');
const asyncify = require('express-asyncify'); 

const {
   getFriends,
} = require('../../../controllers/friend.controller');
 
const advancedResults = require('../../../middleware/advanced.mw');
const Friend = require('../../../models/Friend.model');

// router
const router = express.Router({ mergeParams: true });
 
router.get('/', advancedResults(Friend), getFriends);
 
module.exports = router;