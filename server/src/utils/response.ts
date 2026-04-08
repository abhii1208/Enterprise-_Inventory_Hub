export function success<T>(data: T, message?: string) {
  return {
    success: true,
    message,
    data
  };
}

export function fail(message: string, details?: unknown) {
  return {
    success: false,
    message,
    details
  };
}

