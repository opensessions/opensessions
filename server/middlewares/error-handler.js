const { ApiError } = require('../error');
const logger = require('../logger');

const defaultErrorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    const { statusCode, responseData, rawError } = err;
    const errorMessage = `ERROR serving ${req.originalUrl}:\n\tname: ${rawError.name}\n\tmessage: ${rawError.message}\n\tstack: ${rawError.stack}`;
    // log error
    logger.error(errorMessage);
    // respond with error data already defined in app
    res.status(statusCode).json(responseData);
    return next(rawError);
  }
  if (err instanceof Error) {
    const errorMessage = `ERROR serving ${req.originalUrl}:\n\tname: ${err.name}\n\tmessage: ${err.message}\n\tstack: ${err.stack}`;
    logger.error(errorMessage);
  } else {
    logger.error(err);
  }
  res.status(500).json({ error: 'Something has gone wrong, we have been notified and are working on fixing it.' });
  return next(err);
};


module.exports = defaultErrorHandler;
