// src/utils/refreshAccessToken.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return null;

  try {
    const response = await axios.post(`${API_URL}/token/refresh/`, {
      refresh: refreshToken,
    });
    const newAccess = response.data.access;
    localStorage.setItem("access_token", newAccess);
    axios.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
    return newAccess;
  } catch (err) {
    console.error("Failed to refresh token:", err);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
    return null;
  }
}
