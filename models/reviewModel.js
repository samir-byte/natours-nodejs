// review, rating, createdAt, ref to tour, ref to user

const mongoose = require('mongoose')
const validator = require('validator')
const { Schema } = mongoose;
const Tour = require('./tourModel')

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

  //preventing duplicate tour reviews setting index and unique to true
reviewSchema.index({ tour: 1, user: 1}, {unique: true})


//query middleware
reviewSchema.pre(/^find/, function(next){
    let populateQuery = [{path:'user', select:'-__v'}];

    // console.log(this)
    this.populate(populateQuery);
    next();
});

//static middleware to calc average rating and number of reviews
reviewSchema.statics.calcAverageRatings = async function(tourId){
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: {$sum: 1},
                avgRating: {$avg: '$rating'}
            }
        }
    ])
    console.log(stats)
    if(stats.length > 0){
    await Tour.findByIdAndUpdate(tourId, 
        {ratingsAverage: stats[0].avgRating, 
        ratingsQuantity: stats[0].nRating})
    }
    else{
        await Tour.findByIdAndUpdate(tourId, 
            {ratingsAverage: 4.5, 
            ratingsQuantity: 0})
    }
}

//post middleware when review is saved
reviewSchema.post('save', function(){
    this.constructor.calcAverageRatings(this.tour);
   
})

//pre middleware when review is removed or updated
reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne();
    // console.log(r)
    next();
})

reviewSchema.post(/^findOneAnd/, async function(){
    // this.r = await this.findOne(); Doesn't work since query is already executed
    // console.log(doc)
    await this.r.constructor.calcAverageRatings(this.r.tour);
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;