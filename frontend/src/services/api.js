import axios from "axios";

const API = axios.create({
  baseURL: "https://paycheck-upi.onrender.com/api",
  timeout: 60000
});

export async function checkBackendHealth() {
  const response = await API.get("/health");
  return response.data;
}

export default API;
