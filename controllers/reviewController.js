const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    console.log('this is executing')
    const reviews = await Review.find();
    console.log(reviews);
    res.status(200).json({
        status: 'success',
        data: reviews
    })
})

exports.createReview = catchAsync(async (req, res, next) => {
    const newReview = await Review.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    });
})

