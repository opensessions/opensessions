class ApiError {
  constructor({ statusCode, responseData, rawError }) {
    this.statusCode = statusCode;
    this.responseData = responseData;
    this.rawError = rawError;
  }
}

const createApiError = (statusCode, responseData, rawError) =>
   new ApiError({ statusCode, responseData, rawError })
;

module.exports = { createApiError, ApiError };
