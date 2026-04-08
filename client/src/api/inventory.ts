import { http } from "./http";
import type { ApiResponse, CurrentInventorySnapshot, ImportPreview, InventorySearchResponse } from "../lib/types";

export async function getCurrentInventory(page = 1, limit = 12) {
  const response = await http.get<ApiResponse<CurrentInventorySnapshot>>("/inventory/current", {
    params: { page, limit }
  });
  return response.data.data;
}

export async function searchInventory(sku: string) {
  const response = await http.get<ApiResponse<InventorySearchResponse>>("/inventory/search", {
    params: { sku }
  });
  return response.data.data;
}

export async function previewImport(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await http.post<ApiResponse<ImportPreview>>("/inventory/import/preview", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data.data;
}

export async function commitImport(previewToken: string) {
  const response = await http.post<ApiResponse<unknown>>("/inventory/import/commit", { previewToken });
  return response.data;
}
