const express = require('express');

const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();
const {
  createTour,
  getTours,
  getTourById,
  updateTour,
  deleteTour,
  aliasTopTours,
  getStats,
  getMonthlyPlan,
} = require('../controllers/tourController');

router.use('/:tourId/reviews', reviewRouter);
// will redirect to the review route if this path matches. Now we will not have to write review routes in the tour route files and the code will not be messy. Set the mergeParams to true in the reviewRouter. Now the reviewRouter can also have the tourId param from tourRouter.

// router.param('id', checkId);
// .post(checkBody, createTour);
router.route('/').get(authController.protect, getTours).post(createTour);
router.route('/tours-stats').get(getStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/top-5-tours').get(aliasTopTours, getTours);

router
  .route('/:id')
  .get(getTourById)
  .patch(updateTour)
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), deleteTour);

// post => /tour/123123/reviews
// get => /tour/123123/reviews
// get => /tour/123123/reviews/1231n34
// router
//   .route('/:tourId/reviews')
//   .post(authController.protect, authController.restrictTo('user'), reviewController.createReview);

// FIXED USING MERGE PARAMS ON TOP....
module.exports = router;
