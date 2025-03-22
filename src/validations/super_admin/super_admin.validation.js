import { body, param, query } from "express-validator";

const verifySuperAdminValidation = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Must be a valid email address"),
];

const generateNewOtpForEmailVerificationValidation = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Must be a valid email address"),
];

const verifyEmailViaOtpValidation = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Must be a valid email address"),
  body("otp")
    .exists()
    .withMessage("OTP is required")
    .bail()
    .isLength({ min: 4 })
    .withMessage("OTP must be at least 4 characters long"),
];

export {
    verifySuperAdminValidation,
    generateNewOtpForEmailVerificationValidation,
    verifyEmailViaOtpValidation
}
