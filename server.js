const dotenv = require('dotenv');
const mongoose = require('mongoose');

// on top because this needs to be run before any other code from app.js file. This will allow this exception to be read throughout the code.
process.on('uncaughtException', (err) => {
  console.log('Uncaught exception! Shutting down');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE;
mongoose
  .connect(DB)
  .then(() => console.log('Connected to the DB'))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log('app is listening at port: ', PORT);
});

process.on('unhandledRejection', (err) => {
  console.log('Uncaught exception! Shutting down');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
