import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import { ApiError } from "../../utils/ApiError.utils.js";
import { ApiResponse } from "../../utils/ApiResponse.utils.js";
import { validationResult, body, param, query } from "express-validator";
import Currency from "../../models/common_model/currency.model.js";
import logger from "../../utils/logger.utils.js";

const getCurrency = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Limit must be between 1 and 10"),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("Validation error fetching currencies", {
        errors: errors.array(),
      });
      throw new ApiError(400, "Validation failed", errors.array());
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { rows: currencies, count } = await Currency.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["name", "ASC"]],
    });
    logger.info("fetched currencies", { total: count, page, limit });
    res.json(new ApiResponse(200, { currencies, total: count, page, limit }));
  }),
];

const getCurrencyById = [
  param("id")
    .exists()
    .withMessage("CurrencyId parameter is required")
    .isUUID()
    .withMessage("Invalid currency ID format"),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Validation error fetching currency by id", {
        error: errors.array(),
      });
      throw new ApiError(400, "Validation failed", errors.array());
    }
    const { id } = req.params;
    console.log("this is the id  : ", id);
    const currency = await Currency.findByPk(id);
    console.log("this is the incoming data from the database : ", currency);
    if (!currency) {
      logger.warn("Currency not found", { currencyId: id });
      throw new ApiError(404, "Currency not found");
    }
    // Use new to instantiate ApiResponse
    return res.json(new ApiResponse(200, { currency }));
  }),
];

const createCurrency = [
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
  asyncHandler(async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Validation error creating currency", {
        errors: errors.array(),
      });
      throw new ApiError(400, "Validation failed", errors.array());
    }

    const { name, code, symbol } = req.body;
    // Check if the currency code already exists
    const existingCurrency = await Currency.findOne({ where: { code } });
    if (existingCurrency) {
      logger.warn("Duplicate currency code", { code });
      throw new ApiError(400, "Currency with this code already exists");
    }
    // Create new currency
    console.log("1");
    const newCurrency = await Currency.create({ name, code, symbol });
    console.log("2");
    logger.info("Currency created", { currencyId: newCurrency.id });
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { currency: newCurrency },
          "Currency created successfully"
        )
      );
  }),
];

const updateCurrency = [
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
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Validation error updating currency", {
        errors: errors.array(),
      });
      throw new ApiError(400, "Validation failed", errors.array());
    }
    const { id } = req.params;
    const updatedData = req.body;
    const currency = await Currency.findByPk(id);
    if (!currency) {
      logger.warn("Currency not found for update", { currencyId: id });
      throw new ApiError(404, "Currency not found");
    }
    await currency.update(updatedData);
    logger.info("Currency updated", { currencyId: id });
    return res.json(
      new ApiResponse(200, { currency }, "Currency updated successfully")
    );
  }),
];

const deleteCurrency = [
  param("id")
    .exists()
    .withMessage("CurrencyId parameter is required")
    .isUUID()
    .withMessage("Invalid currency ID format"),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Validation error deleting currency", {
        errors: errors.array(),
      });
      throw new ApiError(400, "Validation failed", errors.array());
    }
    const { id } = req.params;
    const currency = await Currency.findByPk(id);
    console.log("1 : ", currency);
    if (!currency) {
      logger.warn("Currency not found for deletion", { currencyId: id });
      // Throw 404 error
      throw new ApiError(404, "Currency not found");
    }
    await currency.destroy();
    logger.info("Currency deleted", { currencyId: id });
    return res.json(new ApiResponse(200, {}, "Currency deleted successfully"));
  }),
];

export {
  getCurrency,
  getCurrencyById,
  createCurrency,
  updateCurrency,
  deleteCurrency,
};
