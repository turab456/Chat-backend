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
      unique: true,
    },
    //  this is the foreign key
    principal_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'school_principal',
        key: 'principal_id'
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    // this is also the foreign key
    admin_role_id_fk: {
      type: DataTypes.UUID,
      allowNull: false,
      references:{
        model :'user_role',
        key: 'user_role_id'
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    // this is the foreign key for schools
    school_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'school',
        key: 'school_id'
      },
      onDelete : "CASCADE",
      onUpdate: "CASCADE"
    },
    // Here we will strore the arrays of the teachers id enrolled by this admin or under this admin
    teachers_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model: '',
        key: ''
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    // foreign key for the HOD under this admin
    hod_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'school_hod',
        key: 'school_hod_id'
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
  },
  {
    tableName: "school_admin",
    timestamps: true, // Enable timestamps if needed
  }
);

export default SchoolAdmin;
