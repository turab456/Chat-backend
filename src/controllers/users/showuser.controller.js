import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import { ApiResponse } from "../../utils/ApiResponse.utils.js";
import { ApiError } from "../../utils/ApiError.utils.js";
import Users from "../../models/common_model/users.model.js";

const showUsers = asyncHandler(async (req, res) => {
  const users = await Users.findAll(); // or apply filters like where, attributes, etc.
  return res.json(
    new ApiResponse(200, {
      message: "User list",
      data:users
    })
  );
});

export { showUsers };
