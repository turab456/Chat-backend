import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const UserRole = sequelize.define(
  "user_role",
  {
    user_role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      unique: {
        args: true,
        msg: 'Role ID must be unique.',
      },
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        args: true,
        msg: 'Role name must be unique.',
      },
      validate: {
        notEmpty: {
          msg: 'Role name is required.',
        },
        len: {
          args: [3, 50],
          msg: 'Role name must be between 3 and 50 characters.',
        },
      },
    },
  },
  {
    tableName: "user_role",
    timestamps: false, // Enable timestamps if needed
  }
);

export default UserRole;
