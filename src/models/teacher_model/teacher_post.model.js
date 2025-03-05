import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";

const TeacherPost = sequelize.define(
  "SchoolTeacherPost",
  {
    school_teacher_post_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    teacher_role_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user_role",
        key: "user_role_id",
      },
    },
    school_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "school",
        key: "school_id",
      },
    },
    teacher_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "teacher",
        key: "teacher_id",
      },
    },
    coordinator_school_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    class_teacher_grade_section_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "school_teacher_posts",
    timestamps: true,
  }
);

export default TeacherPost;
