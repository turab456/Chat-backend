import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import jwt from "jsonwebtoken";

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

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password, role_id } = req.body;
  if (!fullname || !email || !username || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, "User with email already exists");
  }

  // const avatarLocalPath = req?.files?.avatar?.[0]?.path;
  // if (!avatarLocalPath) throw new ApiError(400, "Avatar is required");

  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // const coverImage = req?.files?.coverImage?.[0]?.path ? await uploadOnCloudinary(req.files.coverImage[0].path) : null;

  const user = await User.create({
    fullname,
    email,
    username: username.toLowerCase(),
    password,
    role_id,
    // avatar: avatar.url,
    // coverImage: coverImage?.url || "",
  });

  res
    .status(201)
    .json(new ApiResponse(200, { user }, "User created successfully"));
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
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  ChangeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
};
