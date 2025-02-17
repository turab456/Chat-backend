import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";

const TypesOfSchool = sequelize.define(
  "school_types",
  {
    // This is the primary key
    type_of_school_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement : true,

    },
    school_type : {
      type: DataTypes.STRING,
      allowNull : false
    }
  },
  {
    tableName: "school_types",
    timestamps: false, // Enable timestamps if needed
  }
);

export default TypesOfSchool;
