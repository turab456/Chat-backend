import { sequelize } from "../db/index.js"; // Adjust the path to your DB connection file
import "../models/school_model/school_owner.model.js";
import "../models/super_admin/super_admin.model.js";
import "../associations_model/plans_model/plans.associations.js";
import "../models/user_roles.model.js";
import "../associations_model/school_model/school_owner.associations.js";
import { SuperAdminAssociation } from "../associations_model/super_admin/super_admin.association.js";

const syncDatabase = async (alter = true) => {
  try {
    SuperAdminAssociation();
    await sequelize.sync({ alter }); // force : true
    console.log("✅ Database synced successfully.");
  } catch (error) {
    console.error("❌ Database sync failed:", error);
  }
};

// To force sync (dropping and recreating tables), pass false and enable force: true
// syncDatabase(false);

export default syncDatabase;
