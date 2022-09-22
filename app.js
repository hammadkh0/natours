const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSantize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const HttpError = require('./utils/httpError');
const globalErrorHandler = require('./controllers/errorController');

// ---- MIDDLEWARES ------ //

// add extra headers to the requests to improve security
app.use(helmet());

// used for logging the requests.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limit the number of requests from the same IP.
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests. Please try again in an hour!',
});
app.use('/api', limiter); // apply limit to all routes in the application.

// serve static files
app.use(express.static(`${__dirname}/public`));

// body parser used for reading data from body into req.body
app.use(express.json({ limit: '100kb' }));

// Data Satanization agains NOSql injection
app.use(mongoSantize());
// Data Satanization agains XSS attacks
app.use(xss());
// Prevent Paraemter pollution
app.use(
  hpp({
    whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price'],
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ---- ROUTES ------ //

/* Mounting the router on the routes */
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find the ${req.originalUrl} route.`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new HttpError(`Can't find the ${req.originalUrl} route.`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
