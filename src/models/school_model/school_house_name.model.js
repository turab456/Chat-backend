const { DataTypes } = require("sequelize");
const { sequelize } = require("../../db/index.js"); // Adjust the path as needed

const SchoolHouseName = sequelize.define(
  "school_house_name",
  {
    // This is the primary key 
    school_house_id: {},
    
    house_name : {}
  },
  {
    tableName: "school_house_name",
    timestamps: false, // Enable timestamps if needed
  }
);

module.exports = SchoolHouseName;
