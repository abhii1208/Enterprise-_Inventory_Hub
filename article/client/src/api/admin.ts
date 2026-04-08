import { http } from "./http";
import type { ApiResponse, AppUser, AuditLog, DashboardMetrics, ImportLog } from "../lib/types";

export async function fetchDashboard() {
  const response = await http.get<ApiResponse<DashboardMetrics>>("/admin/dashboard");
  return response.data.data;
}

export async function fetchUsers() {
  const response = await http.get<ApiResponse<AppUser[]>>("/admin/users");
  return response.data.data;
}

export async function createUser(payload: {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
}) {
  const response = await http.post<ApiResponse<AppUser>>("/admin/users", payload);
  return response.data.data;
}

export async function updateUser(id: string, payload: {
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
}) {
  const response = await http.put<ApiResponse<AppUser>>(`/admin/users/${id}`, payload);
  return response.data.data;
}

export async function toggleUserStatus(id: string, isActive: boolean) {
  const response = await http.patch<ApiResponse<AppUser>>(`/admin/users/${id}/status`, { isActive });
  return response.data.data;
}

export async function requestResetPasswordOtp(id: string) {
  const response = await http.post<ApiResponse<{ sentTo: string; expiresInMinutes: number }>>(
    `/admin/users/${id}/reset-password/request-otp`
  );
  return response.data.data;
}

export async function verifyResetPasswordOtp(id: string, otp: string) {
  const response = await http.post<ApiResponse<{ ok: boolean }>>(`/admin/users/${id}/reset-password/verify-otp`, {
    otp
  });
  return response.data.data;
}

export async function resetPassword(id: string, password: string) {
  const response = await http.post<ApiResponse<{ id: string; email: string }>>(
    `/admin/users/${id}/reset-password`,
    { password }
  );
  return response.data.data;
}

export async function deleteUser(id: string) {
  const response = await http.delete<ApiResponse<{ id: string; email: string }>>(`/admin/users/${id}`);
  return response.data.data;
}

export async function fetchImportHistory() {
  const response = await http.get<ApiResponse<ImportLog[]>>("/admin/import-history");
  return response.data.data;
}

export async function clearImportHistory() {
  const response = await http.delete<ApiResponse<{ deletedCount: number }>>("/admin/import-history");
  return response.data.data;
}

export async function fetchAuditLogs() {
  const response = await http.get<ApiResponse<AuditLog[]>>("/admin/audit-logs");
  return response.data.data;
}

export async function clearAuditLogs() {
  const response = await http.delete<ApiResponse<{ deletedCount: number }>>("/admin/audit-logs");
  return response.data.data;
}
