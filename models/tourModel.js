const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
const { Schema } = mongoose;

const tourSchema = new Schema({
    name:  {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal then 40 characters'],
        minlength: [10, 'A tour name must have more or equal then 10 characters']
        // validate: [validator.isAlpha, 'A tour name must only contain characters']
    },
    slug: String,
    duration:{
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 //setter funcn which runs each time new value is set
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate:{
            validator: function(val){
        // this only points to current doc on NEW document creation so doesnt work for update
                return val < this.price
            },
            message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startLocation: {
        //GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
        
    ],
  }, {
    toJSON: { virtuals: true },
  });

  //creating index for price and ratingsAverage to enhance read performance for price queries
  //index shld be done for most queries searched because it comes with some overhead
tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});
tourSchema.index({startLocation: '2dsphere'});//need to index startLocation to use geospatial queries

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7
})

//virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

//Document middleware - runs before .save() and .create() not in .insertMany()
tourSchema.pre('save', function(next){
    // console.log(this);
    this.slug = slugify(this.name, {lower: true})
    next()
});

// tourSchema.pre('save', function(next){
//     console.log("pre before saved");
//     next()
// });

// tourSchema.post('save', function(doc, next){
//     console.log(doc);
//     next()
// });

//query middleware
// tourSchema.pre('find', function(next){
    tourSchema.pre(/^find/, function(next){
    this.find({secretTour: {$ne: true}})
    this.start = Date.now()
    next()
})

tourSchema.pre(/^find/, function(next){
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })
    next();
});

tourSchema.post(/^find/, function(docs, next){
    console.log(`Query took ${Date.now() - this.start} milliseconds`)
    // console.log(docs);
    next()
})

//aggregate middleware
// tourSchema.pre('aggregate', function(next){
//     this.pipeline().unshift({$match: {secretTour: {$ne: true}}})
//     next()
// })

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;