import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";
import Currency from "../common_model/currency.model.js";
import Language from "../common_model/language.model.js";

const SuperAdmin = sequelize.define(
  "super_admin",
  {
    super_admin_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Full name is required" },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: "Email address already in use" },
      validate: {
        isEmail: { msg: "Must be a valid email address" },
        notEmpty: { msg: "Email is required" },
      },
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: { msg: "Phone number already in use" },
      validate: {
        is: {
          args: [/^\+?[1-9]\d{1,14}$/],
          msg: "Phone number must be in a valid format",
        },
      },
    },
    phone_numberVerify: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "user_role", // Must match the table name of your Role model
        key: "user_role_id", // Must match the primary key in your Role model
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
      validate: {
        notEmpty: { msg: "Role is required" },
        isUUID: {
          args: 4,
          msg: "Role id must be a valid UUID",
        },
      },
    },
    currency_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "currencies",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      validate: {
        isUUID: {
          args: 4,
          msg: "Currency ID must be a valid UUID",
        },
        async existsInCurrency(value) {
          if (value) {
            const currency = await Currency.findByPk(value);
            if (!currency) {
              throw new Error("Currency ID is invalid or does not exist");
            }
          }
        },
      },
    },
    language_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "languages", // Must match the table name of your Language model
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      validate: {
        isUUID: {
          args: 4,
          msg: "Language ID must be a valid UUID",
        },
        async existsInLanguage(value) {
          if (value) {
            const language = await Language.findByPk(value);
            if (!language) {
              throw new Error("Language ID is invalid or does not exist");
            }
          }
        },
      },
    },
    // status: {
    //   type: DataTypes.ENUM("active", "inactive", "suspended"),
    //   defaultValue: "active",
    // },
    profile_picture: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: { msg: "Profile picture must be a valid URL" },
      },
    },
    isEmailVerify_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "verify_email",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "super_admin",
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: "idx_super_admin_full_name",
        fields: ["full_name"],
      },
      {
        name: "idx_super_admin_email",
        fields: ["email"],
      },
      {
        name: "idx_super_admin_phone_number",
        fields: ["phone_number"],
      },
      // Optionally, a composite index for queries that filter by all three:
      {
        name: "idx_super_admin_fullname_email_phone",
        fields: ["full_name", "email", "phone_number"],
      },
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

// Instance method for password verification
SuperAdmin.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Instance method for generating access token
SuperAdmin.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this.super_admin_id,
      email: this.email,
      full_name: this.full_name,
      role_id: this.role_id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
    }
  );
};

// Instance method for generating refresh token
SuperAdmin.generateRefreshToken = function () {
  return jwt.sign(
    { id: this.super_admin_id, role_id: this.role_id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
    }
  );
};

// ✅ Method to update last login timestamp
SuperAdmin.prototype.updateLastLogin = async function () {
  this.last_login = new Date();
  await this.save();
};

export default SuperAdmin;
