import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";

const SchoolLevel = sequelize.define(
  "school_level",
  {
    school_level_id: {
      type:  DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey : true,
      allowNull: false
    },
    school_level : {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: "school_level",
    timestamps: false, // Enable timestamps if needed
  }
);

export default SchoolLevel;
