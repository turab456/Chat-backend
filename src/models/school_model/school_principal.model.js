import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";

const SchoolPrincipal = sequelize.define(
  "school_principal",
  {
    // This is the pk
    principal_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    // this is the foreign key for the role ids
    principal_user_role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user_role",
        key: "user_role_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    principal_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 100], // Name should be between 3 to 100 chars
      },
    },
    profile_picture: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl : true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric : true,
        len : [10,15]
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: { type: DataTypes.STRING },
    // this is the foreig key for the bank details of the admin
    // bank_details_id_fk:{},
  },
  {
    tableName: "school_principal",
    timestamps: true, // Enable timestamps if needed
    underscored: true, // Uses snake_case for columns
    indexes: [
      {unique: false, fields : ["principal_name"]},
      { unique: true, fields: ["email"] }, // Index for faster email lookup
      { unique: true, fields: ["mobile"] }, // Index for faster mobile lookup
    ],
  }
);

export default SchoolPrincipal;
