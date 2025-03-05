import SuperAdmin from "../../models/super_admin/super_admin.model.js";
import UserRole from "../../models/user_roles.model.js";

export const SuperAdminAssociation = () => {
    UserRole.hasMany(SuperAdmin, {
        foreignKey: "role_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
    
    SuperAdmin.belongsTo(UserRole, {
        foreignKey: "role_id",
    });
}