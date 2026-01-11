import axios from "axios";
import axiosRetry from "axios-retry";

const axiosWrapper = () => {
  const baseURL = process.env.REACT_APP_BACKEND_ADDRESS || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  // Add authorization token if available
  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const client = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    headers: headers,
  });

  // Interceptor to handle 401 errors (invalid/expired token)
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token is invalid or expired - clear it
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("groups");
        // Redirect to backend home
        window.location.href = baseURL + "/";
      }
      return Promise.reject(error);
    }
  );

  axiosRetry(client, {
    retries: 3,
    retryDelay: () => 3000,
    retryCondition: (error) => {
      const status = error.response ? error.response.status : null;
      const retryStatusCodes = [499, 530, 598, 599, 502, 503, 504, 505, 506, 507, 440];
      const retryStatus = retryStatusCodes.includes(status) || error.code === "ECONNABORTED";

      return retryStatus;
    },
  });

  return client;
};

export default axiosWrapper;
