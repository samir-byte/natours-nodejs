const Review = require('../models/reviewModel');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.setTourUserIds = (req, res, next) => {
    // Allow nested routes. User can specify manually but the code below will find tour & user from 'req' if not specified.
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id; // 'req.user' comes from 'protect' middleware
    next();
};

exports.checkBookedTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id });

    // 2) Find tours booked by the user and create array of tour Ids
    const tourIds = bookings.map((el) => el.tour.id);

    // 3) Check if current tour Id matches any in rourIds array
    if (!tourIds.includes(req.body.tour)) {
        next(
            new AppError(
                'Sorry! You can only review tours you have booked. Please try again after booking.',
                404
            )
        );
    }
    next();
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
