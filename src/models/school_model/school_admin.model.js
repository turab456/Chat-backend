import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";

const SchoolAdmin = sequelize.define(
  "school_admin",
  {
    // This is the pk
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      unique: true
    },
    //  this is the foreign key 
    principal_id_fk : {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // this is also the foreign key
    admin_role_id_fk : {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // this is the foreign key for schools
    school_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // Here we will strore the arrays of the teachers id enrolled by this admin or under this admin
    teachers_id_fk:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // foreign key for the HOD under this admin 
    hod_id_fk:{
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: "school_admin",
    timestamps: true, // Enable timestamps if needed
  }
);

export default SchoolAdmin;
