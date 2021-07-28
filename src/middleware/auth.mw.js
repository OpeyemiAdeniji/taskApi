const ErrorResponse = require('../utils/errorResponse.util');
const jwt = require('jsonwebtoken');

const { asyncHandler, protect: AuthCheck, authorize: Authorize } = require('@nijisog/todo_common');


// this will protects all routes in the app, if anybody tried to access any route it will push the common code to check the token of the person. 
// if the data exists, it will get the id of the person and used it to find the user in 
// the DB and if it finds the user and the user does not contain any data, 
// it's going to return an error but if it does it will go to the next request 
exports.protect = asyncHandler(async (req, res, next) => { // protect here is to check if someone is logged in
    try {
        
        let authCheck;
        await AuthCheck(req, process.env.JWT_SECRET).then((resp) => { // call protect function from the common code...remember it's promise that is why we use .then 
             authCheck = resp || null;                                   // the AuthCheck function takes in req and secret
        })

    
        // make sure token exists
        if(authCheck === null){
            return next(new ErrorResponse('Invalid token', 401, ['User not authorize to access this route']))
        }

        req.user = { _id: authCheck.id || '', email: authCheck.email || '', roles: authCheck.roles || []}

        if(req.user){
            return next();
        }else{
            return next(new ErrorResponse('Invalid token', 401, ['User not authorize to access this route']));
        }

    } catch (err) {
        console.log(err);
        return next(new ErrorResponse('Error', 401, ['user is not authorize to access this route'])); // it takes in 3params which is message, statusCode and array of erros
    }
});



// Grant access to specific roles
// Roles are strings of arrays. E.g ['superadmin', 'admin']
exports.authorize = (roles) => {

    let authPermit;
    return asyncHandler(async (req, res, next) => {

        const user = req.user; //NB: anytime the authorize function is called, you must have call the protect function because it is the protect function that will create the req.user variable

        if(!user){
            return next(new ErrorResponse('Unauthorized!', 401, ['User is not signed in']));
        }

        await Authorize(roles, user.roles).then((resp) => { // user is the variable gotten from req.user and the User model has a property field called roles
            authPermit = resp;
        })

        if(!authPermit){
            return next(new ErrorResponse('Unauthorized!', 401, ['user is not authorize to access this route']))
        }else{
            return next(); // proceed to next request
        }

    })
}