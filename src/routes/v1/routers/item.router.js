const express = require('express');
const asyncify = require('express-asyncify'); 

const {
   getItems,
} = require('../../../controllers/item.controller');

const Item = require('../../../models/Item.model');

const advancedResults = require('../../../middleware/advanced.mw');

// router
const router = express.Router({ mergeParams: true });
 
router.get('/', advancedResults(Item), getItems);
 
module.exports = router;