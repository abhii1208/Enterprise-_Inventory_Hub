import axios from "axios";
import { toast } from "sonner";

const inferredProductionApi =
  typeof window !== "undefined" && window.location.hostname.endsWith(".vercel.app")
    ? "https://enterprise-inventory-hub.onrender.com/api"
    : undefined;

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? inferredProductionApi ?? "http://localhost:4000/api",
  withCredentials: true
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const backendMessage = error?.response?.data?.message;
    const details = error?.response?.data?.details;
    const detailText = Array.isArray(details)
      ? details
          .map((detail: { path?: string; message?: string }) => detail?.message)
          .filter(Boolean)
          .join(", ")
      : "";
    const message =
      detailText ||
      backendMessage ||
      error?.message ||
      "Something went wrong. Please try again.";

    const shouldSuppressToast = status === 401 || (status === 404 && backendMessage === "Route not found");

    if (!shouldSuppressToast) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);
