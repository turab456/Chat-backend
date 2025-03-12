import { body, param, query } from "express-validator";

export const getCurrencyValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Limit must be between 1 and 10"),
];

export const getCurrencyByIdValidation = [
  param("id")
    .exists()
    .withMessage("CurrencyId parameter is required")
    .isUUID()
    .withMessage("Invalid currency ID format"),
];

export const createCurrencyValidation = [
  body("name").trim().notEmpty().withMessage("Currency name is required"),
  body("code")
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency code must be exactly 3 letters")
    .isAlpha()
    .withMessage("Currency code must contain only letters"),
  body("symbol")
    .trim()
    .notEmpty()
    .withMessage("Currency symbol is required")
    .isLength({ min: 1, max: 10 })
    .withMessage("Currency symbol must be between 1 and 10 characters"),
];

export const updateCurrencyValidation = [
  param("id")
    .exists()
    .withMessage("CurrencyId parameter is required")
    .isUUID()
    .withMessage("Invalid currency ID format"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Currency name cannot be empty"),
  body("code")
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency code must be exactly 3 characters"),
  body("symbol")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Currency symbol cannot be empty"),
];

export const deleteCurrencyValidation = [
  param("id")
    .exists()
    .withMessage("CurrencyId parameter is required")
    .isUUID()
    .withMessage("Invalid currency ID format"),
];
