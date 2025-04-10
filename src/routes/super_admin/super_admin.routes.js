import { Router } from "express";
import { loginUser, registerUser } from "../../controllers/auth/auth.controller.js";
// import { upload } from "../../middlewares/multer.middleware.js";
// import {
//   generateNewOtpForEmailVerificationValidation,
//   verifyEmailViaOtpValidation,
//   verifySuperAdminValidation,
// } from "../../validations/super_admin/super_admin.validation.js";
const router = Router();

router.route("/registerUser").post(registerUser);
router.route("/loginUser").post(loginUser);

// // routes for otp and signup
// router.route("/verifyemail", verifySuperAdminValidation).post(verifySuperAdminEmail);
// router.route("/generate-new-otp", generateNewOtpForEmailVerificationValidation).post(generateNewOtpForEmailVerification);
// router.route("/verifyotp", verifyEmailViaOtpValidation).post(verifyEmailViaOtp);

export default router;
