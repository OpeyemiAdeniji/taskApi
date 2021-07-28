const ErrorResponse = require('../utils/errorResponse.util');

const errorHandler = (err, req, res, next) => {

    let error = { ...err };

    error.message = err.message;

    if(process.env.NODE_ENV === 'development'){
        console.log('theError', err);
    }

    let er = []

    if(err.errors !== undefined){
        er = Object.values(err.errors).map((item) => {
            let m = '';
            if (item.properties){
                m = item.properties.message
            } else {
                m = item;
            }
            return m
        })
    }

    // mongoose bad ObjectId
    if(err.name === 'CastError'){
        const message = 'Resource Not Found || Invalid ObjectId';
        error = new ErrorResponse(message, 401, er)
    }

   	// Mongoose duplicate key
	if (err.code === 11000) {
		const message = `Duplicate field value entered`;
		error = new ErrorResponse(message, 400, er);
	}

	// Mongoose validation error
	if (err.name === 'ValidationError') {

		const message = "An error occured";
		error = new ErrorResponse(message, 400, er);
    }
    
    // Mongoose reference error
	if (err.name === 'ReferenceError') {
		const message = "Something is not right";
		error = new ErrorResponse(message, 500, er);
    }
    
    res.status(error.statusCode || 500).json({
        error: true,
        errors: error.errors ? error.errors : [],
        data: null,
        message: error.message ? error.message : 'Server Error',
        status: error.statusCode ? error.statusCode : 500
    })

}

module.exports = errorHandler;