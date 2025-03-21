import { DataTypes, Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from '../../db/index.js';

const OTP = sequelize.define(
  'otp_codes',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    // Link to the user that requested the OTP
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users', // ensure this matches your users table name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      validate: {
        isUUID: { args: 4, msg: 'Invalid User ID format' },
      },
    },
    verify_email_id : {
      type : DataTypes.UUID,
      allowNull : true,
      references : {
        model : "verify_email",
        key : "id"
      },
      onDelete : "CASCADE",
      onUpdate : "CASCADE",
      validate : {
        isUUID : { args : 4 , msg : "Invalid verify email ID format" }
      }
    },
    // Link to the role of the user (teacher, student, super admin, staff, etc.)
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user_role', // ensure this matches your roles table name
        key: 'user_role_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      validate: {
        notNull: { msg: 'Role ID is required' },
        isInt: { msg: 'Role ID must be an integer' },
      },
    },
    // Store only the hashed OTP (never the raw code)
    hashedOtp: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: 'Hashed OTP is required' },
        // Typical bcrypt hashes are around 60 characters long.
        len: {
          args: [60, 255],
          msg: 'Hashed OTP must be at least 60 characters long',
        },
      },
    },
    // Virtual field to accept the raw OTP (will be hashed in a hook)
    rawOtp: {
      type: DataTypes.VIRTUAL,
      set(value) {
        this.setDataValue('rawOtp', value);
      },
      get() {
        return this.getDataValue('rawOtp');
      },
    },
    // The purpose of the OTP (e.g., LOGIN, SIGNUP, PASSWORD_RESET, 2FA)
    purpose: {
      type: DataTypes.ENUM('LOGIN', 'SIGNUP', 'PASSWORD_RESET', '2FA'),
      allowNull: false,
      validate: {
        notNull: { msg: 'OTP purpose is required' },
        // The isIn validator is optional because ENUM enforces allowed values,
        // but you can keep it for an extra layer of validation.
        isIn: {
          args: [['LOGIN', 'SIGNUP', 'PASSWORD_RESET', '2FA']],
          msg: 'Invalid OTP purpose',
        },
      },
    },
    // Expiry time for the OTP; must be in the future.
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: { msg: 'Expiry time is required' },
        isDate: { msg: 'Expiry time must be a valid date' },
        isFuture(value) {
          if (new Date(value) <= new Date()) {
            throw new Error('Expiry time must be in the future');
          }
        },
      },
    },
    // Number of verification attempts made
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: 'Attempts must be an integer' },
        min: { args: [0], msg: 'Attempts cannot be negative' },
      },
    },
    // Maximum allowed attempts before invalidation
    maxAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      validate: {
        isInt: { msg: 'Max attempts must be an integer' },
        min: { args: [1], msg: 'Max attempts must be at least 1' },
        max: { args: [10], msg: 'Max attempts must not exceed 10' },
      },
    },
    // Optional: IP address from which the OTP request originated.
    // This validator uses custom regex to cover IPv4 and IPv6.
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      validate: {
        isValidIP(value) {
          if (!value) return; // Skip if not provided
          const ipv4Regex = /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/;
          const ipv6Regex = /^((?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,7}:|(?:[0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,5}(?::[0-9A-Fa-f]{1,4}){1,2}|(?:[0-9A-Fa-f]{1,4}:){1,4}(?::[0-9A-Fa-f]{1,4}){1,3}|(?:[0-9A-Fa-f]{1,4}:){1,3}(?::[0-9A-Fa-f]{1,4}){1,4}|(?:[0-9A-Fa-f]{1,4}:){1,2}(?::[0-9A-Fa-f]{1,4}){1,5}|[0-9A-Fa-f]{1,4}:((?::[0-9A-Fa-f]{1,4}){1,6})|:(?::[0-9A-Fa-f]{1,4}){1,7}|:)$/;
          if (!ipv4Regex.test(value) && !ipv6Regex.test(value)) {
            throw new Error('Invalid IP address format');
          }
        }
      },
    },
    // Optional: Device or browser info for additional context.
    deviceInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: 'Device info must be less than 500 characters',
        },
      },
    },
  },
  {
    tableName: 'otp_codes',
    paranoid: true, // Enables soft deletes
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['roleId'] },
      { fields: ['expiresAt'] },
      { fields: ['purpose'] },
    ],
  }
);

// ------------------------
// Sequelize Hook: Hash the raw OTP before creating the record.
// This ensures the raw OTP is not stored in the database.
// ------------------------
OTP.beforeCreate(async (otp, options) => {
  if (otp.rawOtp) {
    otp.hashedOtp = await bcrypt.hash(otp.rawOtp, 10);
  } else {
    throw new Error('Raw OTP must be provided');
  }
});

// ------------------------
// Instance Method: Verify an input OTP against the stored hash.
// ------------------------
OTP.verifyOTP = async function (inputOtp) {
  if (!inputOtp) {
    throw new Error('OTP value is required for verification');
  }
  return await bcrypt.compare(inputOtp, this.hashedOtp);
};

export default OTP;
