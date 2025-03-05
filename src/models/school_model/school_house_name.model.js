import { DataTypes} from "sequelize";
import { sequelize } from "../../db/index.js";

const SchoolHouseName = sequelize.define(
  "school_house_name",
  {
    // This is the primary key 
    school_house_id: {
      type:DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    school_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "school",
        key: "school_id",
      },
    },
    
    house_name : {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: "school_house_name",
    timestamps: false, // Enable timestamps if needed
  }
);

export default SchoolHouseName;
