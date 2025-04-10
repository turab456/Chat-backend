// import UserRole from "../../models/user_roles.model.js";
// import { ApiResponse } from "../../utils/ApiResponse.utils.js";
// import { asyncHandler } from "../../utils/asyncHandler.utils.js";
// import logger from "../../utils/logger.utils.js";

// const getRoles = asyncHandler(async (req, res) => {
//   const get_roles = UserRole.findAll({
//     attributes: ["user_role_id", "name"],
//     order: [["name", "ASC"]], // Sort by role name
//   });

//   logger.info("Roles fetched", { get_roles });
//   return res.json(
//     new ApiResponse(200, { get_roles })
//   );
// });

// export { getRoles };
