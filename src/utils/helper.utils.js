import VerifyEmail from "../models/common_model/verifyEmail.model.js";
import UserRole from "../models/user_roles.model.js";

const isEmailVerified = async (email) => {
  const record = await VerifyEmail.findOne({
    where: {
      email,
      isEmailVerified: true,
    },
  });
  return record;
};

const identifyUserRoleId = async (role_name) => {
  const role_id = await UserRole.findOne({
    where: { name: role_name },
  });
  return role_id.dataValues.user_role_id;
};

export { isEmailVerified, identifyUserRoleId };
