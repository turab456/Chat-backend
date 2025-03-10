class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = [], data = null, code = null, correlationId = null, innerError = null, stackOverride = "") {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.data = data;
    this.success = false;
    this.code = code;
    this.correlationId = correlationId;
    this.timestamp = new Date().toISOString();
    this.innerError = innerError ? innerError.toString() : null;
    if (stackOverride) {
      this.stack = stackOverride;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  toJSON() {
    return {
      success: this.success,
      statusCode: this.statusCode,
      code: this.code,
      message: this.message,
      errors: this.errors,
      data: this.data,
      correlationId: this.correlationId,
      timestamp: this.timestamp,
      innerError: this.innerError,
    };
  }
}

export { ApiError };






















// Updated ApiError.utils.js
// class ApiError extends Error {
//   constructor(
//     statusCode,
//     message = "something went wrong",
//     errors = [],
//     stack = ""
//   ) {
//     super(message);
//     this.statusCode = statusCode; // lowercase
//     this.data = null;
//     this.message = message;
//     this.success = false;
//     this.errors = errors;
//     if (stack) {
//       this.stack = stack;
//     } else {
//       Error.captureStackTrace(this, this.constructor);
//     }
//   }
// }

// export { ApiError };
