import { validationResult } from "express-validator";
import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import logger from "../../utils/logger.utils.js";
import { ApiError } from "../../utils/ApiError.utils.js";
import Language from "../../models/common_model/language.model.js";
import { ApiResponse } from "../../utils/ApiResponse.utils.js";

// Create a new language.
// Validates that the name and code meet requirements and that there is no duplicate entry.
// POST /api/languages
const createLanguage = asyncHandler(async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty) {
    logger.warn("validation error creating language", {
      error: error.array(),
    });
    throw new ApiError();
  }

  const { name, code, is_active } = req.body;
  console.log("point 1");

  const duplicate = await Language.findOne({
    where: {
      name: name,
    },
  });
  console.log("point 2");

  if (duplicate) {
    logger.warn("Duplicate language entry", { name, code });
    throw new ApiError(409, "Language with this name or code already exists");
  }
  console.log("point 3");

  const language = await Language.create({
    name,
    code,
    is_active,
  });
  console.log("point 4");

  logger.info("Language created", { id: language.id, name });

  return res.json(
    new ApiResponse(201, { language }, "Language created succesfully")
  );
});
// Get all languages with optional pagination.
// GET /api/languages?page=1&limit=10

const getLanguages = asyncHandler(async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    logger.warn("Validation error fetching language", {
      error: error.array(),
    });
    throw new ApiError(400, "Validation failed", error.array());
  }

  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const { rows, count } = await Language.findAndCountAll({
    where: { is_active: true }, // commnet this to view all the languages
    attributes: ["id", "name", "is_active"],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["name", "ASC"]],
  });
  logger.info("Language fetched", { total: count, page, limit, count });
  return res.json(
    new ApiResponse(200, { languages: rows, page, limit, count })
  );
});

// Get a language by its ID.
// GET /api/languages/:id

const getLanguageById = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("Validation error fetching language by ID", {
      errors: errors.array(),
    });
    throw new ApiError(400, "Validation failed", errors.array());
  }

  const { id } = req.params;
  const language = await Language.findByPk(id);
  if (!language) {
    logger.warn("Language not found", { id });
    throw new ApiError(404, "Language not found");
  }

  logger.info("Fetched language", { id });
  return res.json(new ApiResponse(200, { language }));
});

// Update an existing language.
// PUT /api/languages/:id
const updateLanguage = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("Validation error updating language", {
      errors: errors.array(),
    });
    throw new ApiError(400, "Validation failed", errors.array());
  }

  const { id } = req.params;
  const updatedData = req.body;
  const language = await Language.findByPk(id);
  if (!language) {
    logger.warn("Language not found for update", { id });
    throw new ApiError(404, "Language not found");
  }

  // Update the record. If you want to check uniqueness, consider checking here as well.
  await language.update(updatedData);
  logger.info("Language updated", { id });

  return res.json(
    new ApiResponse(200, { language }, "Language updated successfully")
  );
});
// Delete a language.
// DELETE /api/languages/:id
const deleteLanguage = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("Validation error deleting language", {
      errors: errors.array(),
    });
    throw new ApiError(400, "Validation failed", errors.array());
  }

  const { id } = req.params;
  const language = await Language.findByPk(id);
  if (!language) {
    logger.warn("Language not found for deletion", { id });
    throw new ApiError(404, "Language not found");
  }

  await language.destroy();
  logger.info("Language deleted", { id });
  return res.json(new ApiResponse(200, null, "Language deleted successfully"));
});

export {
  createLanguage,
  getLanguages,
  getLanguageById,
  updateLanguage,
  deleteLanguage,
};
