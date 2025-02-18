import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";

const SchoolTeacher = sequelize.define(
  "school_teacher",
  {
    school_teacher_id: {},
    admin_id_fk: {},
    teachere_role_id_fk: {},
    school_id_fk: {},
    teacher_name: {},
    profile_picture: {},
    // which school has enrolled this teacher
    admin_role_id_fk: {},
    email:{},
    mobile:{},
    address:{},
    // bank_details_id_fk:{},
    qulification_id_fk:{},
  },
  {
    tableName: "school_teacher",
    timestamps: true, // Enable timestamps if needed
    underscored: true, // Uses snake_case for columns
  }
);

export default SchoolTeacher;
