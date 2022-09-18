const HttpError = require('../utils/httpError');

const handleCastErrorInDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new HttpError(message, 400);
};
const handleDuplicateFieldsInDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new HttpError(message, 400);
};
const handleValidationErrorInDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new HttpError(message, 400);
};
const handeJWTError = () => new HttpError('Invalid token. Please login again', 401);
const handleJWTExpiredError = () => new HttpError('Your Token has expired. Login again', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  // Operational error that is predicted and easily fixed. Send it to client.
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming error. So don't send details to the client.
    console.error('In prod', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again!',
      err: err,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  let errorObject = {
    name: err.name,
    message: err.message,
    code: err.code,
    ...err,
  };
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
    //
  } else if (process.env.NODE_ENV === 'production') {
    // let error = { name: err.name, message: err.message, ...err };
    console.log(errorObject);

    if (errorObject.name === 'CastError') {
      errorObject = handleCastErrorInDB(errorObject);
    }
    if (errorObject.code === 11000) {
      errorObject = handleDuplicateFieldsInDB(errorObject);
    }
    if (errorObject.name === 'ValidationError') {
      errorObject = handleValidationErrorInDB(errorObject);
    }
    if (errorObject.name === 'JsonWebTokenError') {
      errorObject = handeJWTError();
    }
    if (errorObject.name === 'TokenExpiredError') {
      errorObject = handleJWTExpiredError();
    }
    sendErrorProd(errorObject, res);
  }
};
