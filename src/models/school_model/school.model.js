import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";

const SchoolModel = sequelize.define(
  "school",
  {
    // This is the primary key
    school_id: {
      type: DataTypes.INTEGER,
      primaryKey : true,
      autoIncrement: true,
      allowNull : false
    },
    //   this is the foreign key of school id
    school_owner_id_fk: {
      type: DataTypes.INTEGER,
      allowNull : false,
      references: {
        model : 'school_owner',
        key : 'school_owner_id'
      },
      onDelete : 'CASCADE',
      onUpdate: 'CASCADE'
    },
    school_name: {
      type: DataTypes.STRING,
      allowNull : false
    },
    school_images: {
      type : DataTypes.ARRAY(DataTypes.STRING),
      allowNull : true
    },
    address: {
      type : DataTypes.STRING,
      allowNull : true
    },
    state: {
      type : DataTypes.STRING,
      allowNull : true
    },
    city: {
      type : DataTypes.STRING,
      allowNull : true
    },
    country: {
      type : DataTypes.STRING,
      allowNull : true
    },
    branch: {
      type : DataTypes.STRING,
      allowNull : true
    },
    // This is the foreign coming from taxation table and it is based on the country
    // taxation_fk: {},
    licence_number: {
      type : DataTypes.STRING,
      allowNull : false
    },
    // This is the foreign key
    type_of_school: {
      type : DataTypes.INTEGER,
      allowNull: false,
      references:{
        model : 'school_types',
        key: 'type_of_school_id'
      }
    },
    // This is the foreign key for school levels
    school_level_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model : 'school_level',
        key : 'school_level_id'
      }
    },
    // this is a foreign key from board type table
    board_type_fk: {
      type: DataTypes.INTEGER,
      allowNull : false,
      references: {
        model : 'school_board_type',
        key : 'board_id'
      },
      onDelete : 'CASCADE',
      onUpdate : 'CASCADE'
    },
    // This is the foreign key for admins we can store the multiple admins in array
    // admin_ids_fk: {
      
    // },
    // Teachers id as a foreign key to know how many teacers are ther in the scholl
    // teachers_id_fk: {},
  },
  {
    tableName: "school",
    timestamps: false, // Enable timestamps if needed
  }
);

export default SchoolModel;
