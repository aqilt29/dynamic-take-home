/**
 * Standard API Response Utilities
 * Provides consistent response format across all API routes
 */

import { NextResponse } from "next/server";

/**
 * Standard API Response Structure
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a successful API response
 */
export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };
  return NextResponse.json(response, { status });
}

/**
 * Create an error API response
 */
export function apiError(
  message: string,
  status: number = 500,
  code?: string,
  details?: unknown
): NextResponse {
  const errorObject: ApiErrorResponse["error"] = { message };

  if (code) {
    errorObject.code = code;
  }

  if (details !== undefined) {
    errorObject.details = details;
  }

  const response: ApiErrorResponse = {
    success: false,
    error: errorObject,
  };

  return NextResponse.json(response, { status });
}

/**
 * Common error responses
 */
export const CommonErrors = {
  unauthorized: (message = "Unauthorized") =>
    apiError(message, 401, "UNAUTHORIZED"),

  forbidden: (message = "Forbidden") => apiError(message, 403, "FORBIDDEN"),

  notFound: (message = "Resource not found") =>
    apiError(message, 404, "NOT_FOUND"),

  badRequest: (message = "Bad request", details?: unknown) =>
    apiError(message, 400, "BAD_REQUEST", details),

  validationError: (details: unknown) =>
    apiError("Validation failed", 400, "VALIDATION_ERROR", details),

  internalError: (message = "Internal server error", details?: unknown) =>
    apiError(message, 500, "INTERNAL_ERROR", details),

  notImplemented: (message = "Not implemented") =>
    apiError(message, 501, "NOT_IMPLEMENTED"),

  serviceUnavailable: (message = "Service unavailable") =>
    apiError(message, 503, "SERVICE_UNAVAILABLE"),

  configError: (message = "Configuration error") =>
    apiError(message, 500, "CONFIG_ERROR"),
};

/**
 * Convert unknown error to API error response
 */
export function handleError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof Error) {
    return CommonErrors.internalError(error.message, {
      name: error.name,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }

  return CommonErrors.internalError("Unknown error occurred");
}
