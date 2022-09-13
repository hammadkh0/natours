const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;
mongoose
  .connect(DB)
  .then(() => console.log('Connected to the DB'))
  .catch((err) => console.log(err));

// READ .JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// IMPORT THE DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('data successfully loaded');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// DELETE DATA FROM DB

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data successfully deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

/*  process.argv will give the arguments passed in the command line with spaces when running the app.
    For example: node app.js => process.argv[0] === node && process.argv[1] === app.js 
    We will give the command: 
        -> node dev-data/data/import-data.js --delete {3 argv passed} OR
        -> node dev-data/data/import-data.js --import {3 argv passed}
 */
