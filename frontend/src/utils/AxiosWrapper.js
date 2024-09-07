import axios from "axios";
import axiosRetry from "axios-retry";

const axiosWrapper = () => {
  const baseURL = process.env.REACT_APP_BACKEND_ADDRESS || "http://localhost:8000";
  const client = axios.create({
    baseURL: baseURL,
    timeout: 1000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  axiosRetry(client, {
    retries: 3,
    retryDelay: () => 3000,
    retryCondition: (error) => {
      const status = error.response ? error.response.status : null;
      // List of HTTP status codes https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
      const retryStatusCodes = [499, 530, 598, 599, 502, 503, 504, 505, 506, 507, 440];
      const retryStatus = retryStatusCodes.includes(status) || error.code === "ECONNABORTED";

      return retryStatus;
    },
  });

  return client;
};

export default axiosWrapper;
