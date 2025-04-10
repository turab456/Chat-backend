import { Router } from "express";
import { showUsers } from "../../controllers/users/showuser.controller.js";

const router = new Router();

router.route("/show-users").get(showUsers);
export default router;
