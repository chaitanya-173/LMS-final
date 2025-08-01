import axios from "axios";

// Create axios instance with baseURL
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000", 
});

// Automatically attach token (if available) to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
