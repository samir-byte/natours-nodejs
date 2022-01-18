const express = require('express')
const tourController = require('./../controllers/tourController')

const router = express.Router();

//param middleware
// router.param('id', tourController.checkId)

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)

router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.postTour)

router.route('/get-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour)

module.exports = router;