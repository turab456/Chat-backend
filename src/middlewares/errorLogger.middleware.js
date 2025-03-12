import logger from '../utils/logger.utils.js';
import { v4 as uuidv4 } from 'uuid';

const errorLogger = (err, req, res, next) => {
  // ✅ Set HTTP status code from the error, default to 500 if undefined
  res.statusCode = err.statusCode || 500;
  const statusCode = res.statusCode;
  
  // ✅ Generate correlation ID if not provided
  const correlationId = err.correlationId || req.headers['x-correlation-id'] || uuidv4();

  // ✅ Prepare log details
  const logDetails = {
    method: req.method,
    url: req.originalUrl || req.url,
    status: statusCode,
    correlationId,
    ip: req.ip,
    userAgent: req.get('User-Agent') || 'Unknown',
  };

  // ✅ Log full details only in development
  if (process.env.NODE_ENV !== 'production') {
    logger.error(`Error occurred: ${err.message}`, {
      ...logDetails,
      stack: err.stack,
      errors: err.errors || [],
    });
  } else {
    logger.error(`Error occurred: ${err.message}`, logDetails);
  }

  // ✅ Handle internal server error messages securely in production
  let responseMessage = err.message;
  let responseErrors = err.errors || [];

  if (statusCode === 500) {
    if (process.env.NODE_ENV === 'production') {
      responseMessage = 'Internal Server Error';
      responseErrors = [];
    }
  }

  // ✅ Build the response object
  const errorResponse = {
    success: false,
    statusCode,
    message: responseMessage,
    errors: responseErrors,
    correlationId,
    timestamp: new Date().toISOString(),
  };

  // ✅ Explicitly set status code and send response
  res.status(statusCode).json(errorResponse);
};

export default errorLogger;





























// import logger from '../utils/logger.utils.js';

// const errorLogger = (err, req, res, next) => {
//   // Determine HTTP status code and correlation id.
//   const statusCode = err.statusCode || 500;
//   const correlationId = err.correlationId || req.headers['x-correlation-id'] || 'N/A';

//   // Prepare log details.
//   const logDetails = {
//     method: req.method,
//     url: req.originalUrl || req.url,
//     status: statusCode,
//     correlationId,
//   };

//   // Log full error details in non-production.
//   if (process.env.NODE_ENV !== 'production') {
//     logger.error(`Error occurred: ${err.message}`, { ...logDetails, stack: err.stack, errors: err.errors });
//   } else {
//     // In production, log minimal details.
//     logger.error(`Error occurred: ${err.message}`, logDetails);
//   }

//   // Build the error response.
//   // In production, for internal server errors, show a generic message.
//   let responseMessage = err.message;
//   let responseErrors = err.errors || [];

//   if (process.env.NODE_ENV === 'production' && statusCode === 500) {
//     responseMessage = 'Internal Server Error';
//     responseErrors = [];
//   }

//   const errorResponse = {
//     success: false,
//     message: responseMessage,
//     errors: responseErrors,
//     // Optionally, you can include the correlation ID to help clients reference logs.
//     correlationId,
//     timestamp: new Date().toISOString(),
//   };

//   res.status(statusCode).json(errorResponse);
// };

// export default errorLogger;


// import logger from '../utils/logger.utils.js';

// const errorLogger = (err, req, res, next) => {
//   logger.error(
//     `Error occurred: ${err.message} - Method: ${req.method}, URL: ${req.url}, Status: ${err.statusCode || 500}`
//   );

//   res.status(err.statusCode || 500).json({
//     success: false,
//     message: err.message || 'Internal Server Error',
//     errors: err.errors || [],
//   });
// };

// export default errorLogger;

// import logger from '../utils/logger.utils.js';

// const errorLogger = (err, req, res, next) => {
//   logger.error(
//     `Error occurred: ${err.message} - Method: ${req.method}, URL: ${req.url}, Status: ${res.statusCode}`
//   );

//   res.status(err.status || 501).json({
//     success: false,
//     message: err.message || 'Internal Server Error',
//   });
// };

// export default errorLogger;
