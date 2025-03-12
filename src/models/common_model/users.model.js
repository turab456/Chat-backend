import { sequelize } from "../../db/index.js";
import { DataTypes, Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const validateIPAddress = (ip) => {
  const ipV4Pattern =
    /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;
  const ipV6Pattern =
    /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9]))$/;

  return ipV4Pattern.test(ip) || ipV6Pattern.test(ip);
};

const Users = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    user_role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "user_role",
        key: "user_role_id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    language_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    currency_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    ipAddresses: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidIPs(value) {
          if (!Array.isArray(value) || value.length > 2) {
            throw new Error("A maximum of two valid IP addresses is allowed.");
          }
          for (const ip of value) {
            if (!validateIPAddress(ip)) {
              throw new Error(`Invalid IP address format: ${ip}`);
            }
          }
        },
      },
      set(value) {
        this.setDataValue("ipAddresses", value.slice(0, 2));
      },
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
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    indexes: [
      { unique: false, fields: ["user_role_id"] },
      { unique: false, fields: ["isActive"] },
    ],
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

Users.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this.user_id,
      role_id: this.user_role_id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
  );
};

Users.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this.user_id,
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
    { isActive: false },
    {
      where: {
        lastUsedAt: { [Op.lt]: sixMonthsAgo },
        isActive: true,
      },
    }
  );
};

export default Users;
