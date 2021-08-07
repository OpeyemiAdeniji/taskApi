const express = require('express');
const asyncify = require('express-asyncify'); 

const {
   getFriends,
   // getFriend,
   // createFriend
} = require('../../../controllers/friend.controller');
 
const advancedResults = require('../../../middleware/advanced.mw');
const Friend = require('../../../models/Friend.model');

// router
const router = express.Router({ mergeParams: true });
 
const { protect, authorize } = require('../../../middleware/auth.mw');

const roles = ['superadmin', 'admin'];
const allRoles = ['superadmin', 'admin', 'user'];

 
router.get('/', protect, authorize(allRoles), advancedResults(Friend), getFriends);
// router.get('/:id', protect, authorize(allRoles), getFriend);
// router.post('/', protect, authorize(allRoles), createFriend);
 
 
module.exports = router;