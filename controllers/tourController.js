const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getTours = async (req, res) => {
  try {
    // -- BUILD QUERY --//

    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();

    /*
     get the features obj from APIFeaturs class that takes the FIND query and our query string and apply different functions to the query.
    */

    // -- EXECUTE QUERY --//
    const tours = await features.query;

    // -- SEND RESPONSE --//

    res.status(200).send({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: 'fail',
      message: error,
    });
  }
};
exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).send({
        status: 'fail',
        message: 'Could not find a tour for the provided id',
      });
    }
    res.status(200).send({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: 'fail',
      message: error,
    });
  }
};
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).send({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: 'fail',
      message: error,
    });
  }
};
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).send({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: 'fail',
      message: error,
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).send({
      data: null,
    });
  } catch (error) {
    res.status(500).send({
      status: 'fail',
      message: error,
    });
  }
  // 204 = null content
};

exports.getStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          // _id: '$ratingsAverage',
          // _id: { $toUpper: '$difficulty' },
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      { $sort: { avgPrice: 1 } }, // sortby avgPrice (we have to use the new field names now as previous are not in these new documents) //
      // { $match: { _id: { $ne: 'easy' } } }, // just to show we can repeat aggregation pipelines.
    ]);
    res.status(200).send({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: 'fail',
      message: error,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = +req.params.year;
    const plan = await Tour.aggregate([
      {
        /* 
          destruct each element of array and output one docuemnt for each element of the array.Here it will create a new document for all the startDates.
        */
        $unwind: '$startDates',
      },
      {
        /* match the documents that have the dates between the provided year. Example if year if 2021 then all startDates will have year 2021 and months 1-12 */
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        /* 
          ->group all the documents that have the same months and have some extra fields.
          ->In the _id, we used a mongoose expression $month that will extract the startDate from the respective month and assign it to the _id.
         */
        $group: {
          _id: { $month: '$startDates' }, // id = the month number (july = 7)
          numOfStartingTours: { $sum: 1 },
          tours: { $push: '$name' },

          /* 
            $sum:1 will keep adding 1 to the result for every document it reads and the total sum will be equal to the total number of documents retrived in the query.
          */
        },
      },
      { /* add an extra month field seperate from _id*/ $addFields: { month: '$_id' } },
      { /* do not show the _id field as we have added month field */ $project: { _id: 0 } },
      {
        /* sort by number of tours in the month-group. -1 => descending */ $sort: {
          numOfStartingTours: -1,
        },
      },
    ]);

    res.status(200).send({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: 'fail',
      message: error,
    });
  }
};
// const query = await Tour.find({
//   duration: 5,
//   difficulty: 'easy',
// });

// const query = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
