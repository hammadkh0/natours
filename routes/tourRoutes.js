const express = require('express');

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
router.route('/').get(getTours).post(createTour);
router.route('/tours-stats').get(getStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);
router.route('/top-5-tours').get(aliasTopTours, getTours);

module.exports = router;
