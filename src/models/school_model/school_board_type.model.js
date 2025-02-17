import { DataTypes } from "sequelize";
import { sequelize } from "../../db";

const SchoolBoardType = sequelize.define(
  "school_board_type",
  {
    // This is the pk
    board_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey : true
    },
    board_name : {
      type: DataTypes.STRING,
      allowNull: false
    }
    // national , state, international
  },
  {
    tableName: "school_board_type",
    timestamps: false, // Enable timestamps if needed
  }
);

export default SchoolBoardType;
