// import { asyncHandler } from "../utils/asyncHandler.utils.js ";
// import { ApiError } from "../utils/ApiError.utils.js";
// import jwt from "jsonwebtoken";
// import { ACCESS_TOKEN_SECRET } from "../constants.js";

// export const verifyJWT = asyncHandler(async (req, res, next) => {
//   try {
//     const token =
//       req?.cookies?.accessToken ||
//       req.header("Authorization")?.replace("Bearer ", "");

//     if (!token) {
//       throw new ApiError(401, "Unauthorized request");
//     }

//     const decodeToken = jwt.verify(token, ACCESS_TOKEN_SECRET);

//     const user = await User.findById(decodeToken?._id);

//     if (!user) {
//       throw new ApiError(401, "Invalid access token");
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     throw new ApiError(401, err?.message || "Invalid access token");
//   }
// });
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../constants.js";
import Admin from "../models/admin/adminModel/admin.model.js";

// Authentication middleware for verifying the Admin JWT token
export const verifyJWT = asyncHandler(async (req, res, next) => {
  let token = await req?.header("Authorization")?.replace("Bearer ", "");
  console.log("this is the access token : ", token);
  try {
    // 1. Try to get the token from cookies or Authorization header
    const token =
      req?.cookies?.accessToken ||
      req?.header("Authorization")?.replace("Bearer ", "");

    // If token is not found, send an error response
    if (!token) {
      throw new ApiError(401, "Unauthorized request: No token provided");
    }

    // 2. Decode and verify the token
    const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);
    console.log("this is the decoded : ", decodedToken);
    // Ensure the decoded token has the required 'id' field (for admin verification)
    if (!decodedToken?.id) {
      throw new ApiError(401, "Unauthorized request: Invalid token structure");
    }

    // 3. Find the Admin using the decoded token ID
    const admin = await Admin.findByPk(decodedToken.id); // Assuming Sequelize ORM

    // If the Admin is not found, throw an error
    if (!admin) {
      throw new ApiError(401, "Invalid access token: Admin not found");
    }

    // 4. Attach the Admin data to the request object
    req.Admin = admin;

    // 5. Continue to the next middleware
    next();
  } catch (err) {
    // 6. Catch errors and handle them accordingly
    throw new ApiError(401, err?.message || "Invalid access token");
  }
});
