// tests/common/currency.controller.test.js
import request from "supertest";
import Currency from "../../models/common_model/currency.model.js";
import { sequelize } from "../../db/index.js";
import app from "../../../app.js";

describe("Currency API Endpoints", () => {
  // Before all tests, force sync the database (use a test DB)
  beforeAll(async () => {
    await sequelize.sync({ alter: true });
  });

  // After all tests, close the database connection
  afterAll(async () => {
    await sequelize.close();
  });

  describe("POST /api/v1/common/currencies", () => {
    it("should create a new currency with valid data", async () => {
      const res = await request(app)
        .post("/api/v1/common/currencies")
        .send({
          name: "United States Dollar",
          code: "USD",
          symbol: "$",
        })
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.currency).toBeDefined();
      expect(res.body.data.currency.code).toBe("USD");
    });

    it("should fail when currency code is not exactly 3 characters", async () => {
      const res = await request(app)
        .post("/api/v1/common/currencies")
        .send({
          name: "Invalid Currency",
          code: "USDC", // invalid length
          symbol: "$",
        })
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
      expect(Array.isArray(res.body.errors)).toBe(true);
      // Check that one of the errors mentions "exactly 3"
      const errorMsg = res.body.errors.find((err) =>
        err.msg.includes("exactly 3")
      );
      expect(errorMsg).toBeDefined();
    });

    it("should fail when duplicate currency code is provided", async () => {
      // First, create a currency with a given code
      await Currency.create({ name: "Euro", code: "EUR", symbol: "€" });

      // Attempt to create another currency with the same code
      const res = await request(app)
        .post("/api/v1/common/currencies")
        .send({
          name: "Duplicate Euro",
          code: "EUR",
          symbol: "€",
        })
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Currency with this code already exists");
    });
  });

  describe("GET /api/v1/common/currencies", () => {
    it("should return an array of currencies with pagination", async () => {
      // Create additional currencies for testing pagination.
      await Currency.bulkCreate([
        { name: "Japanese Yen", code: "JPY", symbol: "¥" },
        { name: "British Pound", code: "GBP", symbol: "£" },
      ]);

      const res = await request(app)
        .get("/api/v1/common/currencies?page=1&limit=10")
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.currencies)).toBe(true);
      expect(res.body.data).toHaveProperty("total");
      expect(res.body.data).toHaveProperty("page");
      expect(res.body.data).toHaveProperty("limit");
    });
  });

  describe("GET /api/v1/common/currencies/:id", () => {
    let currencyId;

    beforeAll(async () => {
      const currency = await Currency.create({
        name: "Canadian Dollar",
        code: "CAD",
        symbol: "$",
      });
      currencyId = currency.id;
    });

    it("should return the currency for a valid id", async () => {
      const res = await request(app)
        .get(`/api/v1/common/currencies/${currencyId}`)
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.currency).toBeDefined();
      expect(res.body.data.currency.id).toBe(currencyId);
    });

    it("should return 404 for a non-existent currency id", async () => {
      const res = await request(app)
        .get(`/api/v1/common/currencies/00000000-0000-0000-0000-000000000000`)
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Currency not found");
    });

    it("should return 400 for an invalid currency id format", async () => {
      const res = await request(app)
        .get("/api/v1/common/currencies/invalid-id")
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/v1/common/currencies/:id", () => {
    let currencyId;

    beforeAll(async () => {
      const currency = await Currency.create({
        name: "Swiss Franc",
        code: "CHF",
        symbol: "CHF",
      });
      currencyId = currency.id;
    });

    it("should update the currency with valid data", async () => {
      const res = await request(app)
        .put(`/api/v1/common/currencies/${currencyId}`)
        .send({ name: "Updated Swiss Franc" })
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.currency.name).toBe("Updated Swiss Franc");
    });

    it("should return 400 for invalid update data (e.g., wrong code length)", async () => {
      const res = await request(app)
        .put(`/api/v1/common/currencies/${currencyId}`)
        .send({ code: "CHFA" }) // invalid code length
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 for updating a non-existent currency", async () => {
      const res = await request(app)
        .put("/api/v1/common/currencies/00000000-0000-0000-0000-000000000000")
        .send({ name: "Non Existing" })
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Currency not found");
    });
  });

  describe("DELETE /api/v1/common/currencies/:id", () => {
    let currencyId;

    beforeAll(async () => {
      const currency = await Currency.create({
        name: "Test Delete Currency",
        code: "TDC",
        symbol: "T$",
      });
      currencyId = currency.id;
    });

    it("should delete the currency for a valid id", async () => {
      const res = await request(app)
        .delete(`/api/v1/common/currencies/${currencyId}`)
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Currency deleted successfully");
    });

    it("should return 404 for deleting a non-existent currency", async () => {
      const res = await request(app)
        .delete(
          "/api/v1/common/currencies/00000000-0000-0000-0000-000000000000"
        )
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Currency not found");
    });

    it("should return 400 for invalid currency id format in deletion", async () => {
      const res = await request(app)
        .delete("/api/v1/common/currencies/invalid-id")
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
