import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import { ApiError } from "../../utils/ApiError.utils.js";
import { ApiResponse } from "../../utils/ApiResponse.utils.js";
import { validationResult } from "express-validator";
import Currency from "../../models/common_model/currency.model.js";
import logger from "../../utils/logger.utils.js";
import { Op } from "sequelize";

const getCurrency = asyncHandler(async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   logger.error("Validation error fetching currencies", {
  //     errors: errors.array(),
  //   });
  //   throw new ApiError(400, "Validation failed", errors.array());
  // }

  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const { rows: currencies, count } = await Currency.findAndCountAll({
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["name", "ASC"]],
  });
  logger.info("fetched currencies", { total: count, page, limit });
  res.json(new ApiResponse(200, { currencies, total: count, page, limit }));
});

const getCurrencyById = asyncHandler(async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   logger.warn("Validation error fetching currency by id", {
  //     error: errors.array(),
  //   });
  //   throw new ApiError(400, "Validation failed", errors.array());
  // }
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
});

const createCurrency = asyncHandler(async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   logger.warn("Validation error creating currency", {
  //     errors: errors.array(),
  //   });
  //   throw new ApiError(400, "Validation failed", errors.array());
  // }

  const { name, code, symbol } = req.body;

  const existingCurrency = await Currency.findOne({
    where: {
      [Op.or]: [{ code }, { name }, { symbol }],
    },
  });

  if (existingCurrency) {
    logger.warn("Duplicate currency entry", {
      code,
      name,
      symbol,
    });
    throw new ApiError(
      409,
      "Currency with this name, code, or symbol already exists"
    );
  }

  const newCurrency = await Currency.create({ name, code, symbol });

  logger.info("Currency created", {
    currencyId: newCurrency.id,
    name,
    code,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { currency: newCurrency },
        "Currency created successfully"
      )
    );
});

const updateCurrency = asyncHandler(async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   logger.warn("Validation error updating currency", {
  //     errors: errors.array(),
  //   });
  //   throw new ApiError(400, "Validation failed", errors.array());
  // }
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
});

const deleteCurrency = asyncHandler(async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   logger.warn("Validation error deleting currency", {
  //     errors: errors.array(),
  //   });
  //   throw new ApiError(400, "Validation failed", errors.array());
  // }
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
});

export {
  getCurrency,
  getCurrencyById,
  createCurrency,
  updateCurrency,
  deleteCurrency,
};
