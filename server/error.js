class ApiError extends Error {
  constructor(statusCode, responseData, rawError) {
    super(rawError.message);
    this.statusCode = statusCode;
    this.responseData = responseData;
    this.rawError = rawError;
  }

  static init(statusCode, responseData, rawError) {
    return new ApiError(statusCode, responseData, rawError);
  }
}

module.exports = ApiError;
