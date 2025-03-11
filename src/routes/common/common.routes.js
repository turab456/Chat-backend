import { Router } from "express";
import { getCurrency, getCurrencyById, createCurrency, updateCurrency, deleteCurrency } from "../../controllers/common/currency.controller.js";
import { createLanguage, getLanguages } from "../../controllers/common/language.controller.js";
const router = Router();

// currency routes
router.route('/currencies').get(getCurrency)
router.route("/currencies/:id").get(getCurrencyById)
router.route("/currencies").post(createCurrency)
router.route("/currencies/:id").put(updateCurrency)
router.route("/currencies/:id").delete(deleteCurrency)

// language routes 
router.route("/languages").post(createLanguage)
router.route("/languages").get(getLanguages)
router.route("/languages/:id").get(getLanguages)
router.route("/languages/:id").delete(getLanguages)



export default router;