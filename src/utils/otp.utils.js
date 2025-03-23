import bcrypt from "bcrypt";

const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
const hashedOtp = async (rawOtp) => await bcrypt.hash(rawOtp, 10);
const otpExpiresAt = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 15 minutes from now
};

export { rawOtp, hashedOtp, otpExpiresAt };
