import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";

const PlansPackage = sequelize.define(
  "plans_package",
  {
    plans_package_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    number_of_teachers: {
      type: DataTypes.INTEGER, // Changed from NUMBER to INTEGER
      allowNull: true,
      defaultValue: 0,
    },
    number_of_students: {
      type: DataTypes.INTEGER, // Changed from NUMBER to INTEGER
      allowNull: true,
      defaultValue: 0,
    },
    number_of_admins: {
      type: DataTypes.INTEGER, // Changed from NUMBER to INTEGER
      allowNull: true,
      defaultValue: 0,
    },
    number_of_schools: {
      type: DataTypes.INTEGER, // Changed from NUMBER to INTEGER
      allowNull: true,
      defaultValue: 0,
    },
    plan_type_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "plan_type",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    // This is the foreign key for payment 
    // payment_id_fk : {},
    // This is the foreign key for the school ownwer
    school_owner_id_fk : {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "school_owner",
        key: "school_owner_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    start_date_plan: {
      type: DataTypes.DATE,
      allowNull: false, // Ensure a start date is required
      defaultValue: DataTypes.NOW, // Default to current timestamp
    },
    end_date_plan: {
      type: DataTypes.DATE,
      allowNull: true, // End date can be null for ongoing plans
    },
  },
  {
    tableName: "plans_package",
    timestamps: true, // Enable timestamps if needed
  }
);

export default PlansPackage;
