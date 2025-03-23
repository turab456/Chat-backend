import OTP from "../../models/common_model/otp.model.js";
import verifyEmail from "../../models/common_model/verifyEmail.model.js";
import UserRole from "../../models/user_roles.model.js";

export const verifyEmailAssociation = () => {
  verifyEmail.belongsTo(UserRole, {
    foreignKey: "role_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  verifyEmail.belongsTo(OTP,{
    foreignKey : "otp_id",
    onDelete : "CASCADE",
    onUpdate : "CASCADE"
  })
};
