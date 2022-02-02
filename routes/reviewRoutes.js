const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(authController.protect,
          authController.restrictTo('user'),
          reviewController.setTourUserIds,
          reviewController.createReview);

router
    .route('/:id')
    .delete(authController.protect,
        authController.restrictTo('user','admin'),
        reviewController.deleteReview)
    .patch(authController.protect,authController.restrictTo('user','admin'),reviewController.updateReview);
module.exports = router;