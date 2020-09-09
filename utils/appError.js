class AppError extends Error {
    constructor(message, statusCode) {
        // Inherit 'message' property from parent class: Error
        super(message);

        this.statusCode = statusCode;
        // Determine status code based on first number
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        // Apply this property to the error to prevent non-operational errors displaying to the user
        this.isOperational = true;
        // When this function is called it won't appear in the stack trace and pollute it.
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
