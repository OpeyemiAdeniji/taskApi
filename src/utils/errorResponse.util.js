class ErrorResponse extends Error {  // reuse properties and methods of an existing class when you create a new class.
    constructor(message, statusCode, errors){ // A constructor is a function that creates an instance of a class which is typically called an “object”
        super(message); // The super keyword refers to the parent class. It is used to call the constructor of the parent class and to access the parent's properties and methods.
        this.statusCode = statusCode;
        this.errors = errors
    }
}

module.exports = ErrorResponse; 