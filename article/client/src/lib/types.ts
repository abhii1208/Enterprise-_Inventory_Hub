export type Role = "ADMIN" | "USER";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
};

export type DashboardMetrics = {
  totalUsers: number;
  activeUsers: number;
  totalInventoryRecords: number;
  lastUploadDate: string | null;
};

export type InventoryItem = {
  id: string;
  skuCode: string;
  itemName: string;
  shelf: string | null;
  type: string | null;
  quantity: number | null;
  size: string | null;
  color: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InventorySearchResponse = {
  query: string;
  total: number;
  items: InventoryItem[];
};

export type CurrentInventorySnapshot = {
  hasInventory: boolean;
  totalRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
  latestImport: ImportLog | null;
  sampleRows: InventoryItem[];
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
};

export type ImportPreview = {
  previewToken: string;
  fileName: string;
  rowCount: number;
  failedRows: number;
  sampleRows: Array<{
    skuCode: string;
    itemName: string;
    shelf: string | null;
    type: string | null;
    quantity: number | null;
    size: string | null;
    color: string | null;
    imageUrl: string | null;
  }>;
  errors: Array<{ row: number; message: string }>;
};

export type ImportLog = {
  id: string;
  fileName: string;
  uploadedAt: string;
  rowsImported: number;
  failedRows: number;
  status: string;
  summary?: string | null;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
};

export type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  description: string;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};
