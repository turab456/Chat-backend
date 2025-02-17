import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";

const PlanType = sequelize.define(
  "plan_type",
  {
    // Auto-incremented Primary Key
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // Unique, Non-Null Plan Type
    plan_type: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "plan_type",
    timestamps: false, // Enable timestamps if needed
  }
);

export default PlanType;
