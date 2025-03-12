import { Router } from "express";
import {
  getCurrency,
  getCurrencyById,
  createCurrency,
  updateCurrency,
  deleteCurrency,
} from "../../controllers/common/currency.controller.js";
import {
  createLanguage,
  deleteLanguage,
  getLanguageById,
  getLanguages,
  updateLanguage,
} from "../../controllers/common/language.controller.js";
import {
  createCurrencyValidation,
  deleteCurrencyValidation,
  getCurrencyByIdValidation,
  getCurrencyValidation,
  updateCurrencyValidation,
} from "../../validations/common/currency/currency.validation.js";
import {
  createLanguageValidation,
  deleteLanguageValidation,
  getLanguageByIdValidation,
  getLanguagesValidation,
  updateLanguageValidation,
} from "../../validations/common/currency/language.validation.js";

const router = Router();
// put the validation middleware while registering the controllers
// currency routes
router.route("/currencies", getCurrencyValidation).get(getCurrency);
router.route("/currencies/:id", getCurrencyByIdValidation).get(getCurrencyById);
router.route("/currencies", createCurrencyValidation).post(createCurrency);
router.route("/currencies/:id", updateCurrencyValidation).put(updateCurrency);
router
  .route("/currencies/:id", deleteCurrencyValidation)
  .delete(deleteCurrency);

// language routes
router.route("/languages", createLanguageValidation).post(createLanguage);
router.route("/languages", getLanguagesValidation).get(getLanguages);
router.route("/languages/:id", getLanguageByIdValidation).get(getLanguageById);
router.route("/languages/:id", updateLanguageValidation).put(updateLanguage);
router.route("/languages/:id", deleteLanguageValidation).delete(deleteLanguage);

export default router;
