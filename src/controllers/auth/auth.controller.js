import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import { uploadOnCloudinary } from "../../utils/Cloudinary.utils.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError.utils.js";
import { ApiResponse } from "../../utils/ApiResponse.utils.js";
import { v4 as uuidv4, validate as isUUID } from "uuid";
import { hashedOtp, otpExpiresAt, rawOtp } from "../../utils/otp.utils.js";
import VerifyEmail from "../../models/common_model/verifyEmail.model.js";
import { UAParser } from "ua-parser-js";
import OTP from "../../models/common_model/otp.model.js";
import logger from "../../utils/logger.utils.js";
import { Op } from "sequelize";
import { sendEmail } from "../../utils/emailService_custom.utils.js";
import { identifyUserRoleId, isEmailVerified } from "../../utils/helper.utils.js";
import SuperAdmin from "../../models/super_admin/super_admin.model.js";
import UserRole from "../../models/user_roles.model.js";


/**
 * Controller to verify super admin email and generate an OTP record.
 * - If a VerifyEmail record exists and is not verified, it checks for an existing OTP.
 *   - If a valid OTP exists, it instructs the client to use it.
 *   - If an OTP exists but is expired, it soft-deletes it and generates a new OTP.
 * - If no VerifyEmail record exists, it creates one and then generates an OTP record.
 */
const verifySuperAdminEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const role_id =  await identifyUserRoleId("Super_Admin");
  console.log("role id ; ",role_id)
  const roleId = `${role_id}`;

  // Validate roleId format
  if (!roleId || !isUUID(roleId)) {
    logger.warn("Invalid role ID format", { roleId });
    throw new ApiError(400, "Invalid role ID format");
  }

  // Extract device details using ua-parser-js
  const parser = new UAParser(req.headers["user-agent"]);
  const deviceInfo = parser.getResult();
  logger.info("Device info extracted", { deviceInfo });

  // Look for an existing verify email record
  let verifyEmailRecord = await VerifyEmail.findOne({ where: { email } });
  if (verifyEmailRecord) {
    if (verifyEmailRecord.isEmailVerified) {
      logger.warn("Email already verified", { email });
      throw new ApiError(400, "Email is already verified");
    }

    // Email exists but is not verified; check for an existing OTP record (latest one)
    const existingOTP = await OTP.findOne({
      where: { verify_email_id: verifyEmailRecord.id },
      order: [["createdAt", "DESC"]],
    });
    if (existingOTP) {
      if (new Date(existingOTP.expiresAt) > new Date()) {
        logger.info("Valid OTP already exists", {
          email,
          otpId: existingOTP.id,
        });
        throw new ApiError(
          409,
          "An OTP has already been sent and is still valid. Please check your email or generate a new OTP"
        );
      } else {
        await existingOTP.destroy();
        logger.info("Expired OTP soft-deleted", {
          otpId: existingOTP.id,
          email,
        });
      }
    }
  } else {
    verifyEmailRecord = await VerifyEmail.create({
      email,
      role_id: roleId,
    });
    logger.info("Created new VerifyEmail record", {
      email,
      verifyEmailId: verifyEmailRecord.id,
    });
  }

  // Generate a new OTP record
  const generatedRawOtp = rawOtp; // Replace with a random OTP generator as needed
  console.log("OTP  : ", generatedRawOtp);
  const hashedOTP = await hashedOtp(rawOtp);
  const newOTP = await OTP.create({
    verify_email_id: verifyEmailRecord.id,
    roleId: roleId,
    rawOtp: generatedRawOtp, // Will be hashed via model hook
    hashedOtp: hashedOTP,
    purpose: "SIGNUP",
    expiresAt: otpExpiresAt(), // 15 minutes expiry; adjust if needed
    maxAttempts: 5,
    ipAddress: req.ip,
    deviceInfo: JSON.stringify(deviceInfo),
  });
  const sendingEmail = await sendEmail(email, generatedRawOtp);
  console.log("OTP Sent Succesfullt : ", sendingEmail);
  // Update VerifyEmail record with the new OTP ID (if you wish to track it)
  verifyEmailRecord.otp_id = newOTP.id;
  await verifyEmailRecord.save();

  logger.info("New OTP generated", { email, otpId: newOTP.id });

  return res.json(
    new ApiResponse(200, {
      message: "OTP sent to verify email",
      otpId: newOTP.id,
    })
  );
});

/**
 * Controller to generate a new OTP for email verification.
 * - It finds the VerifyEmail record and soft-deletes any existing OTP.
 * - Then it generates a new OTP record and updates the VerifyEmail record.
 */
const generateNewOtpForEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const role_id =  await identifyUserRoleId("Super_Admin");
  console.log("role id ; ",role_id)
  const roleId = `${role_id}`;

  // Validate roleId format
  if (!roleId || !isUUID(roleId)) {
    logger.warn("Invalid role ID format", { roleId });
    throw new ApiError(400, "Invalid role ID format");
  }

  // Find the VerifyEmail record
  const verifyEmailRecord = await VerifyEmail.findOne({ where: { email } });
  if (!verifyEmailRecord) {
    logger.warn("VerifyEmail record not found", { email });
    throw new ApiError(404, "Verify email record not found");
  }

  if (verifyEmailRecord.isEmailVerified) {
    logger.warn("Email is already verified", { email });
    throw new ApiError(400, "Email is already verified");
  }

  // Soft-delete any existing OTP record for this email
  const existingOtp = await OTP.findOne({
    where: { verify_email_id: verifyEmailRecord.id },
    order: [["createdAt", "DESC"]],
  });
  if (existingOtp) {
    await existingOtp.destroy();
    logger.info("Existing OTP soft-deleted", {
      otpId: existingOtp.id,
      email,
    });
  }

  // Extract device info using ua-parser-js
  const parser = new UAParser(req.headers["user-agent"]);
  const deviceInfo = parser.getResult();

  // Generate a new OTP record
  const generatedRawOtp = rawOtp; // Replace with a random OTP generator as needed
  console.log("OTP  : ", generatedRawOtp);
  const hashedOTP = await hashedOtp(generatedRawOtp);
  const newOtpRecord = await OTP.create({
    verify_email_id: verifyEmailRecord.id,
    roleId: roleId,
    rawOtp: generatedRawOtp, // Will be hashed via model hook
    hashedOtp: hashedOTP,
    purpose: "SIGNUP",
    expiresAt: otpExpiresAt(),
    maxAttempts: 5,
    ipAddress: req.ip,
    deviceInfo: JSON.stringify(deviceInfo),
  });
  const sendingEmail = await sendEmail(email, generatedRawOtp);
  console.log("OTP Sent Succesfullt : ", sendingEmail);
  // Update VerifyEmail record with the new OTP ID
  verifyEmailRecord.otp_id = newOtpRecord.id;
  await verifyEmailRecord.save();

  logger.info("New OTP generated (regeneration)", {
    email,
    // otpId: newOtpRecord.id,
  });

  return res.json(
    new ApiResponse(200, {
      message: "New OTP generated and sent to verify the email",
      otpId: newOtpRecord.id,
    })
  );
});

/**
 * Controller to verify the email using the OTP.
 * - It checks that the VerifyEmail record exists.
 * - It then finds the latest OTP record that is not expired.
 * - It verifies the provided OTP; if incorrect, increments attempts.
 * - On a match, marks the email as verified and soft-deletes the OTP record.
 */
const verifyEmailViaOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    logger.warn("Email or OTP not provided", { email, otp });
    throw new ApiError(400, "Email and OTP are required");
  }

  // Retrieve the VerifyEmail record
  const verifyEmailRecord = await VerifyEmail.findOne({ where: { email } });
  if (!verifyEmailRecord) {
    logger.warn("VerifyEmail record not found", { email });
    throw new ApiError(404, "No verification record found for this email");
  }

  // Retrieve the latest valid OTP record
  const otpRecord = await OTP.findOne({
    where: {
      verify_email_id: verifyEmailRecord.id,
      expiresAt: { [Op.gt]: new Date() },
    },
    order: [["createdAt", "DESC"]],
  });
  if (!otpRecord) {
    logger.warn("OTP record not found or expired", { email });
    throw new ApiError(
      400,
      "OTP has expired or does not exist. Please request a new OTP."
    );
  }

  // Check if maximum attempts have been reached
  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    logger.warn("Maximum OTP attempts exceeded", {
      email,
      otpId: otpRecord.id,
      attempts: otpRecord.attempts,
    });
    throw new ApiError(
      400,
      "Maximum OTP attempts exceeded. Please request a new OTP."
    );
  }

  // Verify the OTP using the OTP model's instance method (using bcrypt.compare)
  // console.log("this is the otp  : ",otp)
  const isOtpValid = await OTP.verifyOTP(otpRecord, otp);
  if (!isOtpValid) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    logger.warn("Incorrect OTP entered", {
      email,
      otpId: otpRecord.id,
      attempts: otpRecord.attempts,
    });
    throw new ApiError(400, "Incorrect OTP. Please try again.");
  }

  // OTP is valid: mark the email as verified
  verifyEmailRecord.isEmailVerified = true;
  await verifyEmailRecord.save();

  // Soft-delete the OTP record after successful verification
  await otpRecord.destroy();
  logger.info("Email successfully verified", { email });

  return res.json(
    new ApiResponse(200, { message: "Email successfully verified" })
  );
});

/**
 * Controller to register the user
 * - Take the language and currency id from the api
 * - Register the user if the registered email is verified
 * - Check wether the email is verified or not if verified then only create the user
 * - Upload the profile photo using multer middleware
 * - once user if registered the store the session details of the user in user session (user_session.model.js)
 * - Store the device details of the user and user can't login in more than 2 devices
 * - if they try to login into third device they may need to logout from any of the two devices
 */

const registerSuperAdmin = asyncHandler(async (req, res) => {
  const { full_name, email, currency_id, language_id, password } = req.body;
  const avatarLocalPath = req?.files?.avatar[0]?.path;
  
  const role = UserRole.findOne({
    where : {}
  })
  const role_id = ""
  //  Only proceed if the email is verified
  const verified = isEmailVerified(email);
  console.log("Email verified : ",verified)
  if (!verified) {
    throw new ApiError(403, "Email is not verified");
  }

   // Create the user record.
  //  const newUser = await SuperAdmin.create({
  //   full_name,
  //   email,
  //   role_id,
  //   currency_id,
  //   language_id,
  //   profile_picture
  //  })
  

});

export {
  verifySuperAdminEmail,
  generateNewOtpForEmailVerification,
  verifyEmailViaOtp,
  registerSuperAdmin,
};
