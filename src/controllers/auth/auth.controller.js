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

const verifySuperAdminEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const roleId = "7e207f29-a73b-4546-8ff8-30aea536b6b2";

  // Validate roleId as a valid UUID
  if (!roleId || !isUUID(roleId)) {
    throw new ApiError(400, "Invalid role ID format");
  }

  // Extract device details using ua-parser-js
  const parser = new UAParser(req.headers["user-agent"]);
  const deviceInfo = parser.getResult();

  // Look for an existing verify email record
  let verifyEmailRecord = await VerifyEmail.findOne({ where: { email } });

  if (verifyEmailRecord) {
    // If the email is already verified, we don't need to send a new OTP
    if (verifyEmailRecord.isEmailVerified) {
      throw new ApiError(400, "Email is already verified");
    }

    // Email exists but is not verified; check for an existing OTP record (latest one)
    const existingOTP = await OTP.findOne({
      where: { verify_email_id: verifyEmailRecord.id },
      order: [["createdAt", "DESC"]],
    });

    if (existingOTP) {
      if (new Date(existingOTP.expiresAt) > new Date()) {
        // OTP is still valid – instruct the client to use it
        throw new ApiError(
          409,
          "An OTP has already been sent and is still valid. Please check your email or wait until it expires to request a new one or request a new OTP"
        );
      } else {
        // OTP is expired – soft delete it
        await existingOTP.destroy();
        throw new ApiError(409, "OTP is not valid generate the new otp");
      }
    }
  } else {
    // Create a new VerifyEmail record if it doesn't exist
    verifyEmailRecord = await VerifyEmail.create({
      email,
      role_id: roleId,
    });
  }

  // Generate a new OTP record
  const generatedRawOtp = rawOtp; // Ideally, generate a random OTP dynamically
  const newOTP = await OTP.create({
    verify_email_id: verifyEmailRecord.id,
    roleId: roleId, // Ensure OTP model accepts UUID for roleId (remove isInt validation)
    rawOtp: generatedRawOtp, // The hook on OTP model will hash this value
    purpose: "SIGNUP",
    expiresAt: otpExpiresAt(), // Set expiry 10 minutes from now
    maxAttempts: 5,
    ipAddress: req.ip,
    deviceInfo: JSON.stringify(deviceInfo),
  });

  // Optionally update the VerifyEmail record with the new OTP ID
  verifyEmailRecord.otp_id = newOTP.id;
  await verifyEmailRecord.save();

  console.log("Email Created/Updated:", verifyEmailRecord);
  console.log("New OTP Record:", newOTP);

  return res.json(
    new ApiResponse(200, {
      message: "OTP sent to verify email",
      otpId: newOTP.id,
    })
  );
});

const generateNewOtpForEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const roleId = "7e207f29-a73b-4546-8ff8-30aea536b6b2"; // Fixed role for super admin; ensure this is a valid UUID

  // Validate roleId format
  if (!roleId || !isUUID(roleId)) {
    throw new ApiError(400, "Invalid role ID format");
  }

  // Find the VerifyEmail record
  const verifyEmailRecord = await VerifyEmail.findOne({ where: { email } });
  if (!verifyEmailRecord) {
    throw new ApiError(404, "Verify email record not found");
  }

  // If the email is already verified, no new OTP is needed.
  if (verifyEmailRecord.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  // Soft-delete any existing OTP record for this email
  const existingOtp = await OTP.findOne({
    where: { verify_email_id: verifyEmailRecord.id },
    order: [["createdAt", "DESC"]],
  });
  if (existingOtp) {
    await existingOtp.destroy(); // soft delete due to paranoid:true in the OTP model
  }

  // Extract device info using ua-parser-js
  const parser = new UAParser(req.headers["user-agent"]);
  const deviceInfo = parser.getResult();

  // Generate a new OTP record
  const generatedRawOtp = rawOtp; // ideally, rawOtp returns a randomly generated OTP code
  const newOtpRecord = await OTP.create({
    verify_email_id: verifyEmailRecord.id,
    roleId: roleId, // Ensure the OTP model accepts UUID for roleId
    rawOtp: generatedRawOtp, // Will be hashed in the OTP model hook
    purpose: "SIGNUP",
    expiresAt: otpExpiresAt(), // 10 minutes from now
    maxAttempts: 5,
    ipAddress: req.ip,
    deviceInfo: JSON.stringify(deviceInfo),
  });

  // Update the VerifyEmail record with the new OTP id (optional, if you want to track it)
  verifyEmailRecord.otp_id = newOtpRecord.id;
  await verifyEmailRecord.save();

  return res.json(
    new ApiResponse(200, {
      message: "New OTP generated and sent to verify the email",
      otpId: newOtpRecord.id,
    })
  );
});

const verifyEmailViaOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  // Retrieve the VerifyEmail record
  const verifyEmailRecord = await VerifyEmail.findOne({ where: { email } });
  if (!verifyEmailRecord) {
    throw new ApiError(404, "No verification record found for this email");
  }

  // Retrieve the latest OTP record that is still valid (not expired)
  const otpRecord = await OTP.findOne({
    where: {
      verify_email_id: verifyEmailRecord.id,
      expiresAt: { [Op.gt]: new Date() },
    },
    order: [["createdAt", "DESC"]],
  });

  if (!otpRecord) {
    throw new ApiError(
      400,
      "OTP has expired or does not exist. Please request a new OTP."
    );
  }

  // Check if maximum attempts have been reached
  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    throw new ApiError(
      400,
      "Maximum OTP attempts exceeded. Please request a new OTP."
    );
  }

  // Verify the OTP using the instance method on the OTP model
  const isOtpValid = await otpRecord.verifyOTP(otp);
  if (!isOtpValid) {
    // Increment the attempts and save the record
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new ApiError(400, "Incorrect OTP. Please try again.");
  }

  // OTP is correct: mark the email as verified
  verifyEmailRecord.isEmailVerified = true;
  await verifyEmailRecord.save();

  // Soft-delete the OTP record after successful verification
  await otpRecord.destroy();

  return res.json(
    new ApiResponse(200, { message: "Email successfully verified" })
  );
});

export {
  verifySuperAdminEmail,
  generateNewOtpForEmailVerification,
  verifyEmailViaOtp,
};

// const verifySuperAdminEmail = asyncHandler(async (req, res) => {
//   const { email } = req.body;
//   const roleId = "7e207f29-a73b-4546-8ff8-30aea536b6b2";
//   // ✅ Validate role_id as UUID
//   if (!roleId || !isUUID(roleId)) {
//     throw new ApiError(400, "Invalid role ID format");
//   }

//   const parser = new UAParser(req.headers["user-agent"]);
//   const deviceInfo = parser.getResult();

//   const verifyEmailRecord = await VerifyEmail.findOne({ where: { email } });

//   if (verifyEmailRecord) {
//     if (!verifyEmailRecord?.dataValues?.isEmailVerified) {

//       throw new ApiError(
//         409,
//         `Email exists but is not verified. OTP has beed send to this email : ${email}  Enter OTP to verify the email.`
//       );
//     } else if (!verifyEmailRecord?.dataValues?.isUserCreated) {
//       throw new ApiError(
//         400,
//         "Email already exists & verified but user not created fill the details to create the user"
//       );
//     } else {
//       throw new ApiError(400, "Email already exists");
//     }
//   }

//   const emailCreated = await VerifyEmail.create({
//     email,
//     role_id: roleId, // ✅ Valid UUID
//   });

//   // check for the existing OTP record (ordered by latest created)
//   const existingOTP = await OTP.findOne({
//     where: { verify_email_id: verifyEmailRecord.id },
//   });

//   let otpRecords;
//   if (existingOTP) {
//     if (new Date(existingOTP.expiresAt) <= new Date()) {
//       // soft delete the expired otp
//       await existingOTP.destroy();
//       const generateRawOtp = rawOtp;
//       // create a new OTP record
//       otpRecords = await OTP.create({
//         verify_email_id: verifyEmailRecord.id,
//         roleId: roleId,
//         rawOtp: generateRawOtp,
//         purpose: "SIGNUP",
//         expiresAt: otpExpiresAt(),
//         maxAttempts: 5,
//         ipAddress: req.ip,
//         deviceInfo: JSON.stringify(deviceInfo),
//       });
//     } else {
//       // If a valid OTP exists, you might want to return it or instruct the client to use it.
//       throw new ApiError(
//         409,
//         "An OTP has already been sent and is still valid. Please check your email or request a new OTP if expired."
//       );
//     }
//   } else {
//     // No existing OTP record, so create one.
//     const generateRawOtp = rawOtp;
//     otpRecords = await OTP.create({
//       verify_email_id: verifyEmailRecord.id,
//       roleId: roleId,
//       rawOtp: generateRawOtp,
//       purpose: "SIGNUP",
//       expiresAt: otpExpiresAt(), // 15 minutes from now
//       maxAttempts: 5,
//       ipAddress: req.ip,
//       deviceInfo: JSON.stringify(deviceInfo),
//     });
//   }

//   console.log("Email Created:", emailCreated);

//   return res.json(new ApiResponse(200, { emailCreated }));
// });
