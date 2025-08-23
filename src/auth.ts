import axios from "axios";
import { CMP_AUTH_URL, CMP_CLIENT_ID, CMP_CLIENT_SECRET } from "./config";

let token: string | null = null;
let tokenExpiry: number | null = null;

export const getCmpAccessToken = async (): Promise<string> => {
  if (!token || Date.now() >= (tokenExpiry ?? 0)) {
    const res = await axios.post(
      CMP_AUTH_URL,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CMP_CLIENT_ID,
        client_secret: CMP_CLIENT_SECRET
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    token = res.data.access_token;
    console.log('client bearer token ', token);
    tokenExpiry = Date.now() + res.data.expires_in * 1000;
  }

  return token!;
};

export const getHeaderValues = async () => ({
  Authorization: `Bearer ${await getCmpAccessToken()}`
});