import Users from "../../models/common_model/users.model.js";
import SuperAdmin from "../../models/super_admin/super_admin.model.js";

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

Users.hasOne()