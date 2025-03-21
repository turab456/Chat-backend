import UserSessions from "../../models/common_model/user_session.model.js";
import Users from "../../models/common_model/users.model.js";
import SuperAdmin from "../../models/super_admin/super_admin.model.js";


const userAssociations = () => {
  SuperAdmin.hasOne(Users, {
    foreignKey: "role_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  
  Users.belongsTo(SuperAdmin, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  
  UserSessions.belongsTo(Users , {
    foreignKey : 'userId',
    onDelete : "CASCADE",
    onUpdate : "CASCADE"
  })
  
  Users.hasOne(UserSessions,{
    foreignKey : "user_session_id",
    onDelete : "CASCADE",
    onUpdate : "CASCADE"
  })
}

export default userAssociations;

