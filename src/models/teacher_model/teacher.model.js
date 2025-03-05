import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";

const Teacher = sequelize.define(
  "teacher",
  {
    teacher_id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    employee_id:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    teacher_name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    teacher_post_id_fk:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'user_role',
            key: 'user_role_id'
        }
    },
    profile_picture:{
        type: DataTypes.STRING,
        allowNull: true,
        validate:{
            isUrl: true
        }
    },
    email:{
        type:DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate:{
            isEmail: true
        }
    },
    mobile:{
        type:DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate:{
            isNumeric: true,
            len: [10,20]
        }
    },
    address:{
        type:DataTypes.STRING,
        allowNull: false
    },
    // bank_details_id_fk:{
    //     type:DataTypes.INTEGER,
    //     allowNull: false,
    //     references:{
    //         model: 'bank_details',
    //         key: 'bank_details_id'
    //     }
    // },
    // qualification_id_fk:{
    //     type:DataTypes.INTEGER,
    //     allowNull: false,
    //     references:{
    //         model: 'qualification',
    //         key: 'qualification_id'
    //     }
    // },
  },
  {
    tableName: "teacher",
    timestamps: true,
  }
);

export default Teacher;
