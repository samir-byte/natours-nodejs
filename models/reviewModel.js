// review, rating, createdAt, ref to tour, ref to user

const mongoose = require('mongoose')
const validator = require('validator')
const { Schema } = mongoose;

const reviewSchema = new Schema({
    review: {
        type: String,
        required: [true, 'Review is required'],
        trim: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Rating is required']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
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
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true}
  });

//query middleware
reviewSchema.pre(/^find/, function(next){
    let populateQuery = [{path:'user', select:'-__v'}];

    // console.log(this)
    this.populate(populateQuery);
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;