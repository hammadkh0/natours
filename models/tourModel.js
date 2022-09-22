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
      minlength: [10, 'A tour name must have equal or more than 10 characters'],
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
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
tourSchema.virtual('durationWeeks').get(function () {
  return Math.floor(this.duration / 7);
});

/*
  virtual populate.

  It will populate the tours with the reviews from review Model but will not store the reviews or reviewIds in the database. Thus removing the storage problem.
  * We are using virtual because if we actually tried storing reviews or reviewIds in the tour documents, then there could be infinite reviews to a tour and that would break the 16MB limit of data stored in a single document.

  ref => The key that is used to create a refrence between the 2 Models (Tour and Review). Tour will store the review refrence (only virtually). 
  localField => The primary key in the tour Model that is used to refrence the tours in the review Model.
  foreignField => The name of the foreign key in the review Model that is primary key in the tour Model.
    Review will have a tour field that will store the tour id(_id) {actually stored ids in the db }.
*/

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE
// that runs before .save() or .create(). Can have multiple pre or post middleware
tourSchema.pre('save', function (next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});
tourSchema.pre(/^find/, function (next) {
  // console.log(this);
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });
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
  /*
   Add a $match that selects document that do not have a secret Tour to the aggragation pipeline. This will then be executed along with other $match and $group etc in the aggregate functions defined in the controller. 
   This was done to avoid repition of the same code in all aggregation functions. 
  */
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
