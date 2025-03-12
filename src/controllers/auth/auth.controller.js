import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import { uploadOnCloudinary } from "../../utils/Cloudinary.utils.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError.utils.js";
import { ApiResponse } from "../../utils/ApiResponse.utils.js";
import SuperAdmin from "../../models/super_admin/super_admin.model.js";
import Users from "../../models/common_model/users.model.js";
import { validationResult, body } from "express-validator";


// Custom IP address validator (supports IPv4 & IPv6)
const validateIPAddress = (ip) => {
  const ipV4Pattern =
    /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;
  const ipV6Pattern =
    /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9]))$/;
  return ipV4Pattern.test(ip) || ipV6Pattern.test(ip);
};

const registerSuperAdmin = asyncHandler(async (req, res) => {
  // first_name
  // middle_name
  // last_name
  // email
  // phone_number
  // user_role : super_admin
  // status : active
  // profile
  // login_time_stamp
  // is_active : true
  // password
  // select_language
  // select_currency
  // ip_address

  // Destructure required fields from request body 

  await Promise.all([
    body("full_name").isString().notEmpty().withMessage("Full name is required and must be a string").run(req),
    body("email").isEmail().withMessage("Invalid email format").run(req),
    body("phone_number").optional().isMobilePhone().withMessage("Invalid phone number format").run(req),
    body("password")
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .run(req),
  ]);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400 , errors.array())
    // return res.status(400).json({ errors: errors.array() });
  }

  const { full_name, email, phone_number, password } = req.body;

  // Base field checks
  if (
    !full_name ||
    !email ||
    !password ||
    !select_language ||
    !select_currency ||
    !ip_address
  ) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  // Validate IP address
  if (!validateIPAddress(ip_address)) {
    return res.status(400).json({ message: "Invalid IP address format." });
  }

  // Check for duplicate email
  const existingAdmin = await SuperAdmin.findOne({ where: { email } });
  if (existingAdmin) {
    return res.status(400).json({ message: "Email address already in use." });
  }

  // Force the following fields for a super admin
  const userData = {
    full_name,
    email,
    phone_number,
    // Enforce role and status values
    user_role: "super_admin",
    status: "active",
    profile_picture,
    login_time_stamp: login_time_stamp
      ? new Date(login_time_stamp)
      : new Date(),
    is_active: true,
    password,
    select_language,
    select_currency,
    ip_address,
  };

  // Create new SuperAdmin record (the model hooks handle password hashing)
  const newSuperAdmin = await SuperAdmin.create(userData);

  // Generate JWT tokens via instance methods
  const accessToken = newSuperAdmin.generateAccessToken();
  const refreshToken = newSuperAdmin.generateRefreshToken();
  let data = {
    id: newSuperAdmin.super_admin_id,
    full_name: newSuperAdmin.full_name,
    email: newSuperAdmin.email,
    phone_number: newSuperAdmin.phone_number,
    user_role: newSuperAdmin.user_role,
    status: newSuperAdmin.status,
    profile_picture: newSuperAdmin.profile_picture,
    login_time_stamp: newSuperAdmin.login_time_stamp,
    is_active: newSuperAdmin.is_active,
    select_language: newSuperAdmin.select_language,
    select_currency: newSuperAdmin.select_currency,
    ip_address: newSuperAdmin.ip_address,
    accessToken,
    refreshToken,
  };
  res
    .status(201)
    .json(new ApiResponse(200, { data }, "User created successfully"));
});

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refresh_token = refreshToken;
    await user.save();

    return { refreshToken, accessToken };
  } catch (err) {
    throw new ApiError(500, "Error generating tokens");
  }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findByPk(decodedToken.user_id);
    if (!user || incomingRefreshToken !== user.refresh_token) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user.user_id);
    res
      .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
      .cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true })
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (err) {
    throw new ApiError(401, err.message || "Invalid refresh token");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    where: { [Op.or]: [{ username }, { email }] },
  });
  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user.user_id);
  res
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
    .json(
      new ApiResponse(
        200,
        { user, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.update(
    { refresh_token: null },
    { where: { user_id: req.user.user_id } }
  );
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User logged out"));
});

const ChangeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  console.log("oldPassword : ", oldPassword);
  console.log("newPassword : ", newPassword);
  // this will fetch the user from the verifyJWT if user is there we will get the id
  const user = await User.findById(req.user?._id);
  console.log("this is the id of the user  : ", req.user?._id);
  const isPassowrdCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPassowrdCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed succesfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  if (!fullname || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        username,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Accounts Details updated succesfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading the avatar on cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.res?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(ApiResponse(200, user, "avatar image updated succesfully"));
});

export {
  loginUser,
  logoutUser,
  refreshAccessToken,
  ChangeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  registerSuperAdmin
};
