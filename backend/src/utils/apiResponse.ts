export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const response = {
  success<T>(data: T, message = "Success"): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  },

  created<T>(data: T, message = "Created successfully"): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  },

  paginated<T>(
    data: T[],
    pagination: ApiResponse<T>["pagination"]
  ): ApiResponse<T[]> {
    return {
      success: true,
      data,
      pagination,
    };
  },

  error(message: string, statusCode = 400): ApiResponse<never> & { statusCode: number } {
    const errorResponse: ApiResponse<never> & { statusCode: number } = {
      success: false,
      message,
      statusCode,
    };
    return errorResponse;
  },

  unauthorized(message = "Unauthorized"): ApiResponse<never> & { statusCode: number } {
    return this.error(message, 401);
  },

  forbidden(message = "Forbidden"): ApiResponse<never> & { statusCode: number } {
    return this.error(message, 403);
  },

  notFound(message = "Not found"): ApiResponse<never> & { statusCode: number } {
    return this.error(message, 404);
  },

  badRequest(message = "Bad request"): ApiResponse<never> & { statusCode: number } {
    return this.error(message, 400);
  },
};
