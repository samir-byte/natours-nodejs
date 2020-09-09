const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review cannot be empty!'],
            trim: true
        },
        rating: {
            type: Number,
            required: [true, 'You must specify a rating!'],
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be less than or equal to 5']
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false // Permanently hides fields from being returned in API
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user']
        }
    },
    {
        toJSON: { virtuals: true }, // Display virtual data when output is displayed
        toObject: { virtuals: true }
    }
);

// Ensure each combination of tour and user is unique so a single user cannot write multiple reviews on a tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// QUERY MIDDLEWARE
reviewSchema.pre(/^find/, function (next) {
    // Note: to populate more than one field you need to chain '.populate' methods
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

// Static method used because we needed to call the 'aggregate' method on the model. Creates the ratingsQuantity, and ratingsAverage for the tour which the review was created on
reviewSchema.statics.calculateAverageRatings = async function (tourID) {
    // 'this' points to the current model
    const stats = await this.aggregate([
        {
            $match: { tour: tourID }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 }, // Add 1 for each rating
                avgRating: { $avg: '$rating' } // Specify the field to use for calculations
            }
        }
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourID, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourID, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

// Use 'post' so all the data is saved on the tour before calling 'calculateAverageRatings'
reviewSchema.post('save', function () {
    // 'this' points to the document being saved
    // Can't use 'Review' as it hasn't been declared yet so we can call 'constructor' as it points to the model that created the document e.g Review.calculateAverageRatings(this.tour)
    this.constructor.calculateAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
    // Create a property on 'this' which is the review in this case. Store it on the current query variable. We then have access to it in the 'post' middleware.
    this.r = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    // this.r = await this.findOne(); Does NOT work here as query has already executed. Need to use query middleware to achieve goal but do not have access to the current document.
    await this.r.constructor.calculateAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
