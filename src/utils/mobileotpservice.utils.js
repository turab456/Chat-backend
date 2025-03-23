import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';

dotenv.config();

// ✅ Validate required environment variables
const requiredEnvVars = ['MSG91_AUTH_KEY', 'MSG91_SENDER_ID'];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// ✅ Secure OTP Generation (6 digits)
const generateOtp = () => {
  return crypto.randomInt(100000, 999999); // 6-digit OTP
};

/**
 * ✅ Send OTP via MSG91
 * @param {string} toMobile - Recipient phone number (in +1234567890 format)
 */
export const sendOtp = async (toMobile) => {
  if (!/^\+\d{10,15}$/.test(toMobile)) {
    throw new Error('Invalid mobile number format (e.g., +1234567890)');
  }

  const otp = generateOtp(); // Generate secure OTP

  try {
    const response = await axios.get('https://api.msg91.com/api/v2/sendsms', {
      params: {
        authkey: process.env.MSG91_AUTH_KEY,
        mobiles: toMobile.replace('+', ''),
        sender: process.env.MSG91_SENDER_ID,
        message: `Your OTP is ${otp}. It will expire in 5 minutes.`,
        route: 4,
        country: 91,
      },
    });
  
    if (response.data.type === 'success') {
      console.log(`✅ OTP sent to ${toMobile}: ${otp}`);
      return { success: true, otp };
    } else {
      console.error(`❌ Error sending OTP: ${response.data.message}`);
      throw new Error(response.data.message || 'Unknown error from MSG91');
    }
  } catch (error) {
    console.error(`❌ Error sending OTP to ${toMobile}: ${error.response?.data || error.message}`);
    throw new Error(`Failed to send OTP: ${error.response?.data || error.message}`);
  }
  
};


const run = async () => {
  try {
    const toMobile = '+919899211238'; // Replace with a valid phone number
    const result = await sendOtp(toMobile);
    console.log(`✅ OTP Sent Successfully: ${result.otp}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
};

run()