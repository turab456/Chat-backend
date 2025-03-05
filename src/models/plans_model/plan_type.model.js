import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";
import PlansPackage from "./plans_package.model.js";

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

PlanType.hasOne(PlansPackage, {
  foreignKey: "plan_type_id_fk",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

