const express = require('express');

const router = express.Router({ mergeParams: true });
// Preserve the req.params values from the parent router. If the parent and the child have conflicting param names, the child’s value take precedence

const { getAllReviews, createReview } = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

// post /tour/123sf3/reviews
// get /tour/123sf3/reviews
router.route('/').get(getAllReviews).post(protect, restrictTo('user'), createReview);

module.exports = router;
