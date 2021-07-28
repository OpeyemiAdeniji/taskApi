const rateLimit = require('express-rate-limit');

exports.limitRequest = rateLimit({ 
     windowMs: 10 * 60 * 1000, max: 30000,
     message: 'You have exceeded the 30,000 request in 10 minutes limit', 
     headers: true 
 })