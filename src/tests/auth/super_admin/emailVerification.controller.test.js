// tests/auth/emailVerification.controller.test.js
import request from "supertest";
import { sequelize } from "../../../db/index.js";
import VerifyEmail from "../../../models/common_model/verifyEmail.model.js";
import OTP from "../../../models/common_model/otp.model.js";
import UserRole from "../../../models/user_roles.model.js";
import app from "../../../../app.js";

// Use a fixed OTP for testing purposes
const fixedRawOtp = "123456";

// For predictable expiry, set OTP expiry to 15 minutes from now
const fifteenMinutesFromNow = () => new Date(Date.now() + 15 * 60 * 1000);
const tenMinutesFromNow = () => new Date(Date.now() + 10 * 60 * 1000);
const pastDate = () => new Date(Date.now() - 5 * 60 * 1000);

describe("Email Verification Endpoints", () => {
  beforeAll(async () => {
    // Use force:true to reset database for testing
    await sequelize.sync({ force: true });
    // Optionally, seed a test user role if needed.
    await UserRole.create({ name: "Super Admin" });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should create a new VerifyEmail record and generate an OTP for a new email", async () => {
    const email = "newuser@example.com";
    const res = await request(app)
      .post("/api/v1/superadmin/verifyemail")
      .send({ email })
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toMatch(/OTP sent to verify email/i);

    const verifyRecord = await VerifyEmail.findOne({ where: { email } });
    expect(verifyRecord).toBeTruthy();
    expect(verifyRecord.isEmailVerified).toBeFalsy();

    const otpRecord = await OTP.findOne({ where: { verify_email_id: verifyRecord.id } });
    expect(otpRecord).toBeTruthy();
    expect(otpRecord.attempts).toBe(0);
  });

  it("should return 409 if a valid OTP already exists for an unverified email", async () => {
    const email = "existingotp@example.com";
    // Create a VerifyEmail record and a valid OTP record manually.
    const verifyRecord = await VerifyEmail.create({
      email,
      role_id: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
    });
    await OTP.create({
      verify_email_id: verifyRecord.id,
      roleId: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
      rawOtp: fixedRawOtp,
      purpose: "SIGNUP",
      expiresAt: fifteenMinutesFromNow(),
      maxAttempts: 5,
      ipAddress: "127.0.0.1",
      deviceInfo: "{}",
    });

    const res = await request(app)
      .post("/api/v1/superadmin/verifyemail")
      .send({ email })
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/OTP has already been sent/i);
  });

  it("should soft-delete an expired OTP and generate a new one", async () => {
    const email = "expiredotp@example.com";
    const verifyRecord = await VerifyEmail.create({
      email,
      role_id: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
    });
    const expiredOtp = await OTP.create({
      verify_email_id: verifyRecord.id,
      roleId: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
      rawOtp: fixedRawOtp,
      purpose: "SIGNUP",
      expiresAt: pastDate(), // Expired OTP
      maxAttempts: 5,
      ipAddress: "127.0.0.1",
      deviceInfo: "{}",
    });

    const res = await request(app)
      .post("/api/v1/superadmin/verifyemail")
      .send({ email })
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toMatch(/OTP sent to verify email/i);

    // Verify that the expired OTP is soft-deleted
    const deletedOtp = await OTP.findOne({
      where: { id: expiredOtp.id },
      paranoid: false,
    });
    expect(deletedOtp.deletedAt).toBeTruthy();

    // And a new OTP record exists
    const newOtp = await OTP.findOne({ where: { verify_email_id: verifyRecord.id } });
    expect(newOtp).toBeTruthy();
  });

  it("should error if email is already verified", async () => {
    const email = "verified@example.com";
    await VerifyEmail.create({
      email,
      role_id: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
      isEmailVerified: true,
    });
    const res = await request(app)
      .post("/api/v1/superadmin/verifyemail")
      .send({ email })
      .set("Accept", "application/json");
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already verified/i);
  });
});

describe("POST /api/v1/superadmin/generate-new-otp", () => {
  it("should generate a new OTP and soft-delete any existing OTP", async () => {
    const email = "regenotp@example.com";
    const verifyRecord = await VerifyEmail.create({
      email,
      role_id: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
    });
    const existingOtp = await OTP.create({
      verify_email_id: verifyRecord.id,
      roleId: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
      rawOtp: fixedRawOtp,
      purpose: "SIGNUP",
      expiresAt: fifteenMinutesFromNow(),
      maxAttempts: 5,
      ipAddress: "127.0.0.1",
      deviceInfo: "{}",
    });

    const res = await request(app)
      .post("/api/v1/superadmin/generate-new-otp")
      .send({ email })
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toMatch(/New OTP generated/i);

    // Check that the previous OTP has been soft-deleted
    const deletedOtp = await OTP.findOne({
      where: { id: existingOtp.id },
      paranoid: false,
    });
    expect(deletedOtp.deletedAt).toBeTruthy();

    // And a new OTP record exists
    const newOtpRecord = await OTP.findOne({ where: { verify_email_id: verifyRecord.id } });
    expect(newOtpRecord).toBeTruthy();
  });

  it("should return 404 if VerifyEmail record is not found", async () => {
    const res = await request(app)
      .post("/api/v1/superadmin/generate-new-otp")
      .send({ email: "nonexistent@example.com" })
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Verify email record not found/i);
  });

  it("should error if email is already verified", async () => {
    const email = "alreadyverified@example.com";
    await VerifyEmail.create({
      email,
      role_id: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
      isEmailVerified: true,
    });
    const res = await request(app)
      .post("/api/v1/superadmin/generate-new-otp")
      .send({ email })
      .set("Accept", "application/json");
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already verified/i);
  });
});

describe("POST /api/v1/superadmin/verifyotp", () => {
  it("should verify the OTP successfully and mark email as verified", async () => {
    const email = "verify-success@example.com";
    const verifyRecord = await VerifyEmail.create({
      email,
      role_id: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
    });
    const otpRecord = await OTP.create({
      verify_email_id: verifyRecord.id,
      roleId: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
      rawOtp: fixedRawOtp,
      purpose: "SIGNUP",
      expiresAt: fifteenMinutesFromNow(),
      maxAttempts: 5,
      ipAddress: "127.0.0.1",
      deviceInfo: "{}",
    });

    const res = await request(app)
      .post("/api/v1/superadmin/verifyotp")
      .send({ email, otp: fixedRawOtp })
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toMatch(/successfully verified/i);

    const updatedVerifyRecord = await VerifyEmail.findOne({ where: { email } });
    expect(updatedVerifyRecord.isEmailVerified).toBe(true);

    const deletedOtp = await OTP.findOne({ where: { id: otpRecord.id }, paranoid: false });
    expect(deletedOtp.deletedAt).toBeTruthy();
  });

  it("should return error if email or OTP is missing", async () => {
    const res = await request(app)
      .post("/api/v1/superadmin/verifyotp")
      .send({ email: "missingfields@example.com" })
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it("should return 404 if VerifyEmail record is not found", async () => {
    const res = await request(app)
      .post("/api/v1/superadmin/verifyotp")
      .send({ email: "nonexistent@example.com", otp: fixedRawOtp })
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/No verification record found/i);
  });

  it("should return error if OTP is expired", async () => {
    const email = "otp-expired@example.com";
    const verifyRecord = await VerifyEmail.create({
      email,
      role_id: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
    });
    // Create an expired OTP record
    await OTP.create({
      verify_email_id: verifyRecord.id,
      roleId: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
      rawOtp: fixedRawOtp,
      purpose: "SIGNUP",
      expiresAt: pastDate(),
      maxAttempts: 5,
      ipAddress: "127.0.0.1",
      deviceInfo: "{}",
    });

    const res = await request(app)
      .post("/api/v1/superadmin/verifyotp")
      .send({ email, otp: fixedRawOtp })
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/OTP has expired or does not exist/i);
  });

  it("should increment attempts and return error for incorrect OTP", async () => {
    const email = "otp-incorrect@example.com";
    const verifyRecord = await VerifyEmail.create({
      email,
      role_id: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
    });
    const otpRecord = await OTP.create({
      verify_email_id: verifyRecord.id,
      roleId: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
      rawOtp: fixedRawOtp,
      purpose: "SIGNUP",
      expiresAt: fifteenMinutesFromNow(),
      maxAttempts: 5,
      ipAddress: "127.0.0.1",
      deviceInfo: "{}",
    });

    // Send an incorrect OTP value
    const res = await request(app)
      .post("/api/v1/superadmin/verifyotp")
      .send({ email, otp: "000000" })
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Incorrect OTP/i);

    // Verify that attempts have been incremented
    const updatedOtp = await OTP.findOne({ where: { id: otpRecord.id } });
    expect(updatedOtp.attempts).toBe(1);
  });

  it("should return error if maximum OTP attempts are exceeded", async () => {
    const email = "otp-max@example.com";
    const verifyRecord = await VerifyEmail.create({
      email,
      role_id: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
    });
    // Create an OTP record with attempts equal to maxAttempts (simulate max attempts reached)
    await OTP.create({
      verify_email_id: verifyRecord.id,
      roleId: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
      rawOtp: fixedRawOtp,
      purpose: "SIGNUP",
      expiresAt: fifteenMinutesFromNow(),
      maxAttempts: 3, // lower maxAttempts for testing
      attempts: 3,
      ipAddress: "127.0.0.1",
      deviceInfo: "{}",
    });

    const res = await request(app)
      .post("/api/v1/superadmin/verifyotp")
      .send({ email, otp: fixedRawOtp })
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Maximum OTP attempts exceeded/i);
  });
});

  describe("POST /api/v1/superadmin/generate-new-otp", () => {
    it("should generate a new OTP and soft-delete the existing one", async () => {
      const email = "regenotp@example.com";
      // Create a VerifyEmail record and a valid OTP record
      const verifyRecord = await VerifyEmail.create({
        email,
        role_id: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
      });
      const existingOtp = await OTP.create({
        verify_email_id: verifyRecord.id,
        roleId: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
        rawOtp: fixedRawOtp,
        purpose: "SIGNUP",
        expiresAt: fifteenMinutesFromNow(),
        maxAttempts: 5,
        ipAddress: "127.0.0.1",
        deviceInfo: "{}",
      });

      const res = await request(app)
        .post("/api/v1/superadmin/generate-new-otp")
        .send({ email })
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toMatch(/New OTP generated/);

      // The existing OTP should be soft-deleted
      const deletedOtp = await OTP.findOne({ where: { id: existingOtp.id }, paranoid: false });
      expect(deletedOtp.deletedAt).toBeTruthy();

      // A new OTP record should be created
      const newOtpRecord = await OTP.findOne({ where: { verify_email_id: verifyRecord.id } });
      expect(newOtpRecord).toBeTruthy();
    });

    it("should error if VerifyEmail record is not found", async () => {
      const res = await request(app)
        .post("/api/v1/superadmin/generate-new-otp")
        .send({ email: "nonexistent@example.com" })
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Verify email record not found/);
    });

    it("should error if email is already verified", async () => {
      const email = "alreadyverified@example.com";
      await VerifyEmail.create({
        email,
        role_id: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
        isEmailVerified: true,
      });
      const res = await request(app)
        .post("/api/v1/superadmin/generate-new-otp")
        .send({ email })
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already verified/);
    });
  });

  describe("POST /api/v1/superadmin/verifyotp", () => {
    it("should verify the OTP successfully", async () => {
      const email = "verify-success@example.com";
      // Create VerifyEmail record and OTP record with valid expiry
      const verifyRecord = await VerifyEmail.create({
        email,
        role_id: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
      });
      const otpRecord = await OTP.create({
        verify_email_id: verifyRecord.id,
        roleId: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
        rawOtp: fixedRawOtp,
        purpose: "SIGNUP",
        expiresAt: fifteenMinutesFromNow(),
        maxAttempts: 5,
        ipAddress: "127.0.0.1",
        deviceInfo: "{}",
      });

      const res = await request(app)
        .post("/api/v1/superadmin/verifyotp")
        .send({ email, otp: fixedRawOtp })
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toMatch(/successfully verified/);

      // Verify that the record is marked as verified
      const updatedVerifyRecord = await VerifyEmail.findOne({ where: { email } });
      expect(updatedVerifyRecord.isEmailVerified).toBe(true);

      // The OTP record should be soft-deleted
      const deletedOtp = await OTP.findOne({ where: { id: otpRecord.id }, paranoid: false });
      expect(deletedOtp.deletedAt).toBeTruthy();
    });

    it("should error if email or OTP is missing", async () => {
      const res = await request(app)
        .post("/api/v1/superadmin/verifyotp")
        .send({ email: "missingfields@example.com" }) // missing otp
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it("should error if VerifyEmail record is not found", async () => {
      const res = await request(app)
        .post("/api/v1/superadmin/verifyotp")
        .send({ email: "nonexistent@example.com", otp: fixedRawOtp })
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/No verification record found/);
    });

    it("should error if OTP is expired", async () => {
      const email = "otp-expired@example.com";
      const verifyRecord = await VerifyEmail.create({
        email,
        role_id: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
      });
      // Create an expired OTP record
      await OTP.create({
        verify_email_id: verifyRecord.id,
        roleId: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
        rawOtp: fixedRawOtp,
        purpose: "SIGNUP",
        expiresAt: pastDate(), // expired OTP
        maxAttempts: 5,
        ipAddress: "127.0.0.1",
        deviceInfo: "{}",
      });

      const res = await request(app)
        .post("/api/v1/superadmin/verifyotp")
        .send({ email, otp: fixedRawOtp })
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/OTP has expired or does not exist/);
    });

    it("should increment attempts and return error for incorrect OTP", async () => {
      const email = "otp-incorrect@example.com";
      const verifyRecord = await VerifyEmail.create({
        email,
        role_id: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
      });
      const otpRecord = await OTP.create({
        verify_email_id: verifyRecord.id,
        roleId: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
        rawOtp: fixedRawOtp,
        purpose: "SIGNUP",
        expiresAt: fifteenMinutesFromNow(),
        maxAttempts: 5,
        ipAddress: "127.0.0.1",
        deviceInfo: "{}",
      });

      // Send an incorrect OTP value
      const res = await request(app)
        .post("/api/v1/superadmin/verifyotp")
        .send({ email, otp: "000000" })
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Incorrect OTP/);

      // Verify that attempts have been incremented
      const updatedOtp = await OTP.findOne({ where: { id: otpRecord.id } });
      expect(updatedOtp.attempts).toBe(1);
    });

    it("should return error if maximum OTP attempts exceeded", async () => {
      const email = "otp-max-attempts@example.com";
      const verifyRecord = await VerifyEmail.create({
        email,
        role_id: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
      });
      // Create an OTP record with attempts equal to maxAttempts
      const otpRecord = await OTP.create({
        verify_email_id: verifyRecord.id,
        roleId: "7e207f29-a73b-4546-8ff8-30aea536b6b2",
        rawOtp: fixedRawOtp,
        purpose: "SIGNUP",
        expiresAt: fifteenMinutesFromNow(),
        maxAttempts: 3, // setting maxAttempts lower for testing
        attempts: 3,    // already reached max attempts
        ipAddress: "127.0.0.1",
        deviceInfo: "{}",
      });

      const res = await request(app)
        .post("/api/v1/superadmin/verifyotp")
        .send({ email, otp: fixedRawOtp })
        .set("Accept", "application/json");

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Maximum OTP attempts exceeded/);
    });
  });
// });
