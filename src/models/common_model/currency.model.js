import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";

const Currency = sequelize.define(
  "Currency",
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
        notEmpty: { msg: "Currency name cannot be empty" },
        len: {
          args: [2, 100],
          msg: "Currency name must be between 2 and 100 characters",
        },
      },
    },
    code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Currency code cannot be empty" },
        isAlpha: { msg: "Currency code must contain only letters" },
        len: { args: [3, 3], msg: "Currency code must be exactly 3 letters" },
      },
    },
    symbol: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        len: {
          args: [1, 10],
          msg: "Currency symbol must be between 1 and 10 characters",
        },
      },
    },
    exchange_rate: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 1.0,
      validate: {
        isDecimal: { msg: "Exchange rate must be a decimal number" },
        min: { args: [0.0001], msg: "Exchange rate must be greater than 0" },
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "currencies",
    timestamps: true,
    paranoid: true,
    indexes: [{ unique: true, fields: ["name", "code"] }],
  }
);
export default Currency;
