import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const UserRole = sequelize.define(
  "user_role",
  {
    user_role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_type : {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  },
  {
    tableName: "user_role",
    timestamps: false, // Enable timestamps if needed
  }
);

export default UserRole;
