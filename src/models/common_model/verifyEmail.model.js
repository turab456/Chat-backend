// models/pending_super_admin.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";

const VerifyEmail = sequelize.define(
  "verify_email",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "user_role",
        key: "user_role_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      validate: {
        notNull: { msg: "Role ID is required" },
      },
    },
    isUserCreated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    otp_id:{
      type : DataTypes.UUID,
      allowNull : true,
      references : {
        model : "otp_codes",
        key : "id"
      },
      onDelete : "CASCADE",
      onUpdate : "CASCADE"
    }
  },
  {
    tableName: "verify_email",
    timestamps: true,
    paranoid: true,
  }
);

export default VerifyEmail;
