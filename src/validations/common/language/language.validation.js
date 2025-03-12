import { body, param, query } from "express-validator";

export const createLanguageValidation = [
  body("name")
    .trim()
    .notEmpty()
    .isLength({ min: 2, max: 100 })
    .withMessage("Language must be between 2 and 100 characters"),
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Language code is required")
    .isAlpha()
    .withMessage("Language name must contain only letters")
    .isLength({ min: 2, max: 10 })
    .withMessage("Language code must be between 2 and 100 characters"),
  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is active must be a boolena"),
];

export const getLanguagesValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage("Limit must be between 1 and 30"),
];

export const getLanguageByIdValidation = [
  param("id")
    .exists()
    .withMessage("Language ID parameter is required")
    .isUUID()
    .withMessage("Invalid language ID format"),
];

export const updateLanguageValidation = [
  param("id")
    .exists()
    .withMessage("Language ID parameter is required")
    .isUUID()
    .withMessage("Invalid language ID format"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Language name cannot be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("Language name must be between 2 and 100 characters"),
  body("code")
    .optional()
    .trim()
    .isAlpha()
    .withMessage("Language code must contain only letters")
    .isLength({ min: 2, max: 10 })
    .withMessage("Language code must be between 2 and 10 characters"),
  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active must be a boolean"),
];

export const deleteLanguageValidation = [
  param("id")
    .exists()
    .withMessage("Language ID parameter is required")
    .isUUID()
    .withMessage("Invalid language ID format"),
];
