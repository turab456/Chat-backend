import OTP from "../../models/common_model/otp.model.js";
import Users from "../../models/common_model/users.model.js";
import VerifyEmail from "../../models/common_model/verifyEmail.model.js";
import UserRole from "../../models/user_roles.model.js";

const OTPAssociation = () => {
  OTP.belongsTo(Users, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  OTP.belongsTo(UserRole, {
    foreignKey: "roleId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  OTP.belongsTo(VerifyEmail,{
    foreignKey : "verify_email_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
};

export default OTPAssociation;