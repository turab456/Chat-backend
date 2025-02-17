const { DataTypes } = require("sequelize");
const { sequelize } = require("../../db/index.js"); // Adjust the path as needed

const SchoolHOD = sequelize.define(
  "school_hod",
  {
    // This is the primary key 
    school_hod_id: {},
    // this is the foreign key from teachers table  
    teaher_id_fk : {},
    // this is the foreign key of school admin
    admin_id_fk: {},
    // this is the forignkey for hod type high school, primary and etc
    type_of_hod: {}
  },
  {
    tableName: "school_hod",
    timestamps: false, // Enable timestamps if needed
  }
);

module.exports = SchoolHOD;
