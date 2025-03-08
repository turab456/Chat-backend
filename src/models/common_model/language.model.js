import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";

const Language = sequelize.define(
  "Language",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Language name cannot be empty" },
        len: {
          args: [2, 100],
          msg: "Language name must be between 2 and 100 characters",
        },
      },
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Language code cannot be empty" },
        isAlpha: { msg: "Language code must contain only letters" },
        len: {
          args: [2, 10],
          msg: "Language code must be between 2 and 10 characters",
        },
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "languages",
    timestamps: true,
    paranoid: true,
    indexes: [{ unique: true, fields: ["name", "code"] }],
  }
);

export default Language
