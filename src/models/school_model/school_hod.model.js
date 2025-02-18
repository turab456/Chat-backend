const { DataTypes } = require("sequelize");
const { sequelize } = require("../../db/index.js"); // Adjust the path as needed

const SchoolHOD = sequelize.define(
  "school_hod",
  {
    // This is the primary key 
    school_hod_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    // this is the foreign key from teachers table  
    teaher_id_fk : {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'teachers',
        key: 'teacher_id'
      },
    },
    // this is the foreign key of school admin
    admin_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // this is the forignkey for hod type high school, primary and etc
    type_of_hod: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    tableName: "school_hod",
    timestamps: false, // Enable timestamps if needed
  }
);

module.exports = SchoolHOD;
