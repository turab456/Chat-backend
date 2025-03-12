import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";

const SchoolOwner = sequelize.define(
  "school_owner",
  {
    school_owner_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    school_owner_role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "user_role",
        key: "user_role_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    // this is the foreign key which will store multiple ids of the school in to form of array or object
    school_id: {
      type: DataTypes.INTEGER, // Changed from NUMBER to INTEGER
      allowNull: true,
      defaultValue: 0,
    },
    name: {
      type: DataTypes.STRING, 
      allowNull: true,
      defaultValue: 0,
    },
    profile_picture: {
      type: DataTypes.STRING, 
      allowNull: true,
      defaultValue: 0,
    },
    //   This is the plan id which user will select from the plan package
    plan_package_id_fk: {
      type: DataTypes.INTEGER, // Changed from NUMBER to INTEGER
      allowNull: true,
      references: {
        model: "plans_package",
        key: "plans_package_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "school_owner",
    timestamps: true, // Enable timestamps if needed
  }
);

export default SchoolOwner;
