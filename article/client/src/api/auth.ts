import { http } from "./http";
import type { ApiResponse, AuthUser } from "../lib/types";

export async function login(payload: { email: string; password: string }) {
  const response = await http.post<ApiResponse<AuthUser>>("/auth/login", payload);
  return response.data.data;
}

export async function fetchBootstrapStatus() {
  const response = await http.get<ApiResponse<{ requiresSetup: boolean }>>("/auth/bootstrap-status");
  return response.data.data;
}

export async function registerFirstAdmin(payload: { name: string; email: string; password: string }) {
  const response = await http.post<ApiResponse<AuthUser>>("/auth/register-first-admin", payload);
  return response.data.data;
}

export async function requestPasswordHelp(payload: { email: string }) {
  const response = await http.post<ApiResponse<{ requestedBy: string; adminRecipients: string[] }>>(
    "/auth/request-password-help",
    payload
  );
  return response.data.data;
}

export async function requestForgotPasswordOtp(payload: { email: string }) {
  const response = await http.post<ApiResponse<{ sentTo: string; expiresInMinutes: number }>>(
    "/auth/forgot-password/request-otp",
    payload
  );
  return response.data.data;
}

export async function verifyForgotPasswordOtp(payload: { email: string; otp: string }) {
  const response = await http.post<ApiResponse<{ ok: boolean }>>("/auth/forgot-password/verify-otp", payload);
  return response.data.data;
}

export async function resetForgotPassword(payload: { email: string; newPassword: string }) {
  const response = await http.post<ApiResponse<{ ok: boolean }>>("/auth/forgot-password/reset", payload);
  return response.data.data;
}

export async function me() {
  const response = await http.get<ApiResponse<AuthUser>>("/auth/me");
  return response.data.data;
}

export async function logout() {
  const response = await http.post<ApiResponse<{ ok: boolean }>>("/auth/logout");
  return response.data.data;
}

export async function requestChangePasswordOtp(payload: { currentPassword: string }) {
  const response = await http.post<ApiResponse<{ sentTo: string; expiresInMinutes: number }>>(
    "/auth/change-password/request-otp",
    payload
  );
  return response.data.data;
}

export async function changePassword(payload: { currentPassword: string; newPassword: string; otp: string }) {
  const response = await http.post<ApiResponse<{ ok: boolean }>>("/auth/change-password", payload);
  return response.data.data;
}
