const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      // validate: [validator.isAlpha, 'Tour name must only contain letters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5  '],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (discountVal) {
          // this point to the current doc on new document creation.
          return discountVal < this.price;
        },
        message: 'Discount price ({VALUE}) must be less than actual price',
      },
    },
    summary: {
      required: [true, 'A tour must have a description'],
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [{ type: String }],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
tourSchema.virtual('durationWeeks').get(function () {
  return Math.floor(this.duration / 7);
});

// DOCUMENT MIDDLEWARE
// that runs before .save() or .create(). Can have multiple pre or post middleware
tourSchema.pre('save', function (next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// DOCUMENT MIDDLEWARE that runs after the .save() or .create().
// Here we dont need or have the this keyword as document has been created and present in this middlware

tourSchema.post('save', (doc, next) => {
  // console.log(doc);
  // do something.
  next();
});

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  // this middleware can be used for all find, findOne, findOneAndUpdate etc.
  this.find({ secretTour: { $ne: true } });
  this.startTime = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took: ${Date.now() - this.startTime} milliseconds`);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
