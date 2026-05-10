// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Database errors
    if (err.code) {
        switch (err.code) {
            case '23505': // Unique violation
                statusCode = 409;
                message = 'Resource already exists';
                break;
            case '23503': // Foreign key violation
                statusCode = 400;
                message = 'Referenced resource does not exist';
                break;
            case '22P02': // Invalid input syntax
                statusCode = 400;
                message = 'Invalid input data';
                break;
            default:
                message = 'Database error occurred';
        }
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;