import { Router } from "express";
import { registerSuperAdmin } from "../../controllers/auth/auth.controller.js";
const router = Router();

router.route("/registersuperadmin").post(
  upload.fields([
    {
      name: "profile",
      maxCount: 1,
    },
  ]),
  registerSuperAdmin
);