import dotenv from "dotenv";
dotenv.config();

export const CMP_AUTH_URL = "https://accounts.cmp.optimizely.com/o/oauth2/v1/token";
export const CMP_BASE_URL = "https://api.cmp.optimizely.com";

export const CMP_CLIENT_ID = process.env.CLIENT_ID || "";
export const CMP_CLIENT_SECRET = process.env.CLIENT_SECRET_DEV || "";