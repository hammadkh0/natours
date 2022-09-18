const express = require('express');

const authController = require('../controllers/authController');

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

module.exports = router;
