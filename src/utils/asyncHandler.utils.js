import logger from "./logger.utils.js";
import { ApiError } from "./ApiError.utils.js";

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      // Log the error centrally
      logger.error(`Error in asyncHandler: ${err.message}`, {
        stack: err.stack,
      });

      // Wrap non-ApiError errors as internal server errors
      if (!(err instanceof ApiError)) {
        return next(new ApiError(500, "Internal Server Error", err));
      }
      next(err);
    });
  };
};

export { asyncHandler };

// const asyncHandler = (requestHandler) => {
//   return (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch((err) => {
//       next(err);
//     });
//   };
// };

// export { asyncHandler };

// const asyncHandler = (func) => async (req,res,next) => {
//     try{
//         await func(req,res,next)
//     }catch(err){
//         res.status(err.code || 500).json({
//             success : false,
//             message : err.message
//         })
//     }
// }

// export { asyncHandler };
