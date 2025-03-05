// tests/superAdmin.test.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sequelize } from "../../db/index.js";
import SuperAdmin from "../../models/super_admin/super_admin.model.js";
import Role from "../../models/user_roles.model.js"; // Ensure this is your Role model

// Optionally, set default values for token secrets and expiration if not set.
process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "testAccessSecret";
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "testRefreshSecret";
process.env.ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "1h";
process.env.REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || "7d";

describe("SuperAdmin Model", () => {
  let testRole;

  // Create a dummy role for testing before running tests.
  beforeAll(async () => {
    // Force sync the database so we start with a fresh schema.
    await sequelize.sync({ force: true });
    testRole = await Role.create({
      name: "SuperAdmin Role",
      description: "Role for SuperAdmins",
    });
  });

  // Close DB connection after all tests
  afterAll(async () => {
    await sequelize.close();
  });

  test("should create a super admin with valid inputs", async () => {
    const superAdmin = await SuperAdmin.create({
      full_name: "John Doe",
      email: "john@example.com",
      password: "Password@123",
      phone_number: "+1234567890",
      role_id: testRole.user_role_id, // Adjust this if your PK field is different
    });

    expect(superAdmin.id).toBeDefined();
    expect(superAdmin.full_name).toEqual("John Doe");
    // Verify the password is hashed
    expect(superAdmin.password).not.toEqual("Password@123");
  });

  test("should throw a validation error for an invalid email", async () => {
    await expect(
      SuperAdmin.create({
        full_name: "Jane Doe",
        email: "invalid-email",
        password: "Password@123",
        role_id: testRole.user_role_id,
      })
    ).rejects.toThrow(/Must be a valid email address/);
  });

  test("should throw a validation error for a weak password", async () => {
    await expect(
      SuperAdmin.create({
        full_name: "Weak Password",
        email: "weak@example.com",
        password: "weakpass",
        role_id: testRole.user_role_id,
      })
    ).rejects.toThrow(
      /Password must be at least 8 characters long, and contain at least one lowercase letter, one uppercase letter, one number, and one special character/
    );
  });

  test("should throw a validation error for an invalid phone number", async () => {
    await expect(
      SuperAdmin.create({
        full_name: "Invalid Phone",
        email: "phone@example.com",
        password: "Password@123",
        phone_number: "123abc", // invalid format
        role_id: testRole.user_role_id,
      })
    ).rejects.toThrow(/Phone number must be in a valid format/);
  });

  test("should require a role_id", async () => {
    await expect(
      SuperAdmin.create({
        full_name: "No Role",
        email: "norole@example.com",
        password: "Password@123",
      })
    ).rejects.toThrow(/notNull Violation/);
  });

  test("should hash the password on creation and validate it", async () => {
    const plainPassword = "Password@123";
    const superAdmin = await SuperAdmin.create({
      full_name: "Hash Test",
      email: "hash@example.com",
      password: plainPassword,
      role_id: testRole.user_role_id,
    });

    expect(superAdmin.password).not.toEqual(plainPassword);
    const isValid = await superAdmin.isPasswordCorrect(plainPassword);
    expect(isValid).toBe(true);
  });

  test("should update password and rehash it", async () => {
    const oldPassword = "Password@123";
    const newPassword = "NewPassword@123";
    const superAdmin = await SuperAdmin.create({
      full_name: "Update Test",
      email: "update@example.com",
      password: oldPassword,
      role_id: testRole.user_role_id,
    });

    const oldHashedPassword = superAdmin.password;
    superAdmin.password = newPassword;
    await superAdmin.save();

    expect(superAdmin.password).not.toEqual(oldHashedPassword);
    const isValid = await superAdmin.isPasswordCorrect(newPassword);
    expect(isValid).toBe(true);
  });

  test("should generate a valid access token", async () => {
    const superAdmin = await SuperAdmin.create({
      full_name: "Token Test",
      email: "token@example.com",
      password: "Password@123",
      role_id: testRole.user_role_id,
    });

    const token = superAdmin.generateAccessToken();
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    expect(decoded.email).toEqual("token@example.com");
    expect(decoded.full_name).toEqual("Token Test");
    expect(decoded.role_id).toEqual(superAdmin.role_id);
  });

  test("should generate a valid refresh token", async () => {
    const superAdmin = await SuperAdmin.create({
      full_name: "Refresh Token Test",
      email: "refresh@example.com",
      password: "Password@123",
      role_id: testRole.user_role_id,
    });

    const token = superAdmin.generateRefreshToken();
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    expect(decoded.id).toEqual(superAdmin.id);
  });

  test("should enforce the unique email constraint", async () => {
    const email = "unique@example.com";
    await SuperAdmin.create({
      full_name: "Unique Email",
      email,
      password: "Password@123",
      role_id: testRole.user_role_id,
    });

    await expect(
      SuperAdmin.create({
        full_name: "Duplicate Email",
        email,
        password: "Password@123",
        role_id: testRole.user_role_id,
      })
    ).rejects.toThrow();
  });

  test("should enforce the unique phone number constraint", async () => {
    const phone = "+1234567890";
    await SuperAdmin.create({
      full_name: "Unique Phone",
      email: "uniquephone@example.com",
      password: "Password@123",
      phone_number: phone,
      role_id: testRole.user_role_id,
    });

    await expect(
      SuperAdmin.create({
        full_name: "Duplicate Phone",
        email: "duplicatephone@example.com",
        password: "Password@123",
        phone_number: phone,
        role_id: testRole.user_role_id,
      })
    ).rejects.toThrow();
  });
});
