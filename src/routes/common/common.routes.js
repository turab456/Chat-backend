import { Router } from "express";
import { getCurrency, getCurrencyById, createCurrency, updateCurrency, deleteCurrency } from "../../controllers/common/currency.controller.js";
const router = Router();

router.route('/currencies').get(getCurrency)
router.route("/currencies/:id").get(getCurrencyById)
router.route("/currencies").post(createCurrency)
router.route("/currencies/:id").put(updateCurrency)
router.route("/currencies/:id").delete(deleteCurrency)

export default router;