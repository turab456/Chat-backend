export const DB_NAME = "LMS";
export const PORT = process.env.PORT || 3000;

export const cloudinary_cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
export const cloudinary_api_key = process.env.CLOUDINARY_API_KEY;
export const cloudinary_api_secret = process.env.CLOUDINARY_API_SECRET;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
// variables to connect with the database
export const username = String(process.env.USER_NAME) || "postgres";
export const password = String(process.env.PASSWORD) || "root";
export const database = String(process.env.DATABASE_NAME) || "maskan_lms_db";
export const host = String(process.env.HOST) || "localhost";
export const dialect = String(process.env.DILECT) || "postgres";
export const ADMIN_BASE_URL = "/api/v1/admin";
export const COMMON_BASE_URL = "/api/v1/common"
export const SUPER_ADMIN_URL = '/api/v1/superadmin'