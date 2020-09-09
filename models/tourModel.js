const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

// Used to specify a schema for our data where we can set validator for each field. In the 'required' field the values should be 'true' ans id not it will display the string that follows as an error.
const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [40, 'A tour name cannot exceed 40 characters'],
            minlength: [10, 'A tour name must contain more than 10 characters']
            // Using 3rd party validation
            //validate: [
            //    validator.isAlpha,
            //    'Tour name must only contain characters',
            //],
        },
        slug: String,
        ratingsAverage: {
            type: Number,
            default: 4.5,
            // 'min' / 'max' also works for dates.
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be less than or equal to 5'],
            set: (val) => Math.round(val * 10) / 10 // Rounds the average to 1dp
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        duration: {
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
            // 'enum' is only for strings
            enum: {
                values: ['easy', 'medium', 'difficult'], // Pass array of permitted strings.
                message: 'Difficulty must be either: easy, medium or difficult' // Error message.
            }
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price']
        },
        priceDiscount: {
            type: Number,
            // Custom validator using normal function as we need 'this' keyword.
            // 'this' only points to current doc on NEW document creation (not updates).
            validate: {
                validator: function (val) {
                    return val < this.price; // Only validates as true if priceDiscount < price.
                },
                message:
                    'Discount price ({VALUE}) should be lower than the regular price'
            }
        },
        summary: {
            type: String,
            trim: true, // Removes whitespace from beginning and end of string.
            required: [true, 'A tour must have a description']
        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image']
        },
        images: [String], // Specifies an array of strings
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false // Permanently hides fields from being returned in API
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false
        },
        startLocation: {
            // GeoJSON
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
                type: mongoose.Schema.ObjectId, // Each of the guides in the array will be MongoDB id
                ref: 'User' // Establish 'User' as ref object
            }
        ]
    },
    {
        toJSON: { virtuals: true }, // Display virtual data when output is displayed
        toObject: { virtuals: true }
    }
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// Virtual data is not persisted on the database but calculated when we 'get' the data e.g. useful for converting data to different units.
// Can't use an arrow function because they don't get their own 'this' keyword.
// Can't query this info as it's not part of the database.
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour', // Links to the 'tour' field in 'reviewModel'
    localField: '_id' // The id of the tour we are finding reviews for
});

// DOCUMENT MIDDLEWARE - runs before .save() and .create() but NOT other functions.
// Allows us to complete tasks before and after functions
// 'save' is referred to as the 'hook'
tourSchema.pre('save', function (next) {
    // 'this' points to document currently in process
    // Create a slug for the tour being created
    this.slug = slugify(this.name, { lower: true });
    next();
});

/*
// Embed the tour guides into the tour model example
tourSchema.pre('save', async function (next) {
    // Will return an array of promises
    const guidesPromises = this.guides.map(
        async (id) => await User.findById(id)
    );
    // Run all promises and save over the original 'guides'
    this.guides = await Promise.all(guidesPromises);
    next();
});

// More examples of document middleware...
tourSchema.pre('save', function (next) {
    console.log('Wil save document...');
    next();
});

// .post() has access to the previously saved document as 'doc' in this case.
tourSchema.post('save', function (doc, next) {
    console.log(doc);
    next();
});
*/

// QUERY MIDDLEWARE - amends the query to remove and tours with attribute secretTour: true before passing to functions in tour controller e.g. getAllTours
// 'this' points to the query
// Regular expression here means it searches for all instances of strings that start with 'find' e.g. findOne, findById etc.
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

// Populate 'guides' and hide fields listed in 'select' property for each query beginning with 'find'
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} , milliseconds`);
    next();
});

/*
// AGGREGATION MIDDLEWARE - removes all the documents that have secretTour: true from the stats
// 'this' points to current aggregation object
tourSchema.pre('aggregate', function (next) {
    // .unshift() adds an item to the BEGINNING of an array
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});
*/

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
