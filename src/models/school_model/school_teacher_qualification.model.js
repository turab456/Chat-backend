import { sequelize } from "../../db";

const SchoolTeacherQualification = sequelize.define(
  {
    school_teacher_qualification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    teacher_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "school_teacher",
        key: "school_teacher_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    qualification_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qualification_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    year_of_passing: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate:{
        isInt: true,
        min : 1900,
        max: new Date().getFullYear(),
        msg: "Year of passing should be between 1900 and current year"
      }
    },
    percentage: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    institution_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    institution_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    degree_license_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "school_teacher_qualification",
    timestamps: true,
    underscored: true, // Uses snake_case for columns
  }
);

export default SchoolTeacherQualification;
