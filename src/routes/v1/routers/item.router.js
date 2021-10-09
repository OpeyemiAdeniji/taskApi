const express = require('express');

const {
   getItems, 
   getItem,
   createItem,
   completeItem,
   deleteItem
} = require('../../../controllers/item.controller');

const Item = require('../../../models/Item.model');

const advancedResults = require('../../../middleware/advanced.mw');

// router
const router = express.Router({ mergeParams: true });
 
const { protect, authorize } = require('../../../middleware/auth.mw');

const roles = ['superadmin', 'admin'];
const allRoles = ['superadmin', 'admin', 'user'];


router.get('/', protect, authorize(allRoles), advancedResults(Item), getItems);
router.get('/:id', protect, authorize(allRoles), getItem);
router.post('/', protect, authorize(allRoles), createItem);
router.put('/:id', protect, authorize(allRoles), completeItem);
router.delete('/:id', protect, authorize(allRoles), deleteItem);
 
module.exports = router; 