import { sequelize } from "../../db/index.js";
import { DataTypes, Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const Users = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },

    // user_id: {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    //   onDelete: "RESTRICT",
    //   onUpdate: "CASCADE",
    // },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,

      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 100],
        isStrongPassword(value) {
          if (
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
              value
            )
          ) {
            throw new Error(
              "Password must include uppercase, lowercase, number, and special character."
            );
          }
        },
      },
    },
    accessToken: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [20, 500],
          msg: "Refresh token must be between 20 and 500 characters",
        },
      },
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [20, 500],
          msg: "Refresh token must be between 20 and 500 characters",
        },
      },
    },
    isActive: {
      type: DataTypes.ENUM("active", "inactive", "suspended"),
      defaultValue: "active",
      allowNull: false,
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    paranoid: true,
    // indexes: [
    //   { unique: false, fields: ["user_role_id"] },
    //   { unique: false, fields: ["isActive"] },
    // ],
  }
);

Users.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

Users.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

Users.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

Users.prototype.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this.id,
      // role_id: this .user_role_id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
  );
};

Users.prototype.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    }
  );
};

Users.markInactiveUsers = async function () {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  await Users.update(
    { isActive: "inactive" },
    {
      where: {
        lastUsedAt: { [Op.lt]: sixMonthsAgo },
        isActive: "active",
      },
    }
  );
};

export default Users;
