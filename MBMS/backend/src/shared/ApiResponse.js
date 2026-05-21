// shared/ApiResponse.js

/**
 * Standard API Response Utility
 * Keeps all responses consistent across the backend
 */

class ApiResponse {
  constructor(statusCode, message, data = null, success = true) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = success;
  }

  static success(message = 'Success', data = null, statusCode = 200) {
    return new ApiResponse(statusCode, message, data, true);
  }

  static created(message = 'Created successfully', data = null) {
    return new ApiResponse(201, message, data, true);
  }

  static error(message = 'Something went wrong', statusCode = 500, data = null) {
    return new ApiResponse(statusCode, message, data, false);
  }
}

module.exports = ApiResponse;