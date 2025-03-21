import { Router } from "express";
import { verifySuperAdminEmail } from "../../controllers/auth/auth.controller.js";
import { upload } from "../../middlewares/multer.middleware.js";
const router = Router();

// router.route("/registersuperadmin",upload).post(
//   upload.fields([
//     {
//       name: "profile",
//       maxCount: 1,
//     },
//   ]),
//   registerSuperAdmin
// );

router.route('/verifyemail').post(verifySuperAdminEmail)


export default router;
