import Association from "../associations_model/association.js";
import { sequelize } from "../db/index.js";
const syncDatabase = async (alter = true) => {
  try {
    Association();
    await sequelize.sync({ alter }); // force : true
    console.log("✅ Database synced successfully.");
  } catch (error) {
    console.error("❌ Database sync failed:", error);
  }
};

export default syncDatabase;
