const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE;
mongoose
  .connect(DB)
  .then(() => console.log('Connected to the DB'))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('app is listening at port: ', PORT);
});
