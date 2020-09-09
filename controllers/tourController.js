const multer = require('multer'); // Used for uploading files
const sharp = require('sharp'); // Image processing library
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

/*
// Read the file and parse it into an array of JS objects
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);
*/

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            new AppError('Not an image! Please only upload image files.', 400),
            false
        );
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

// When it's a single field with multiple files use '.array' method
// upload.array('images', 3) req.files

// When it's a mix of fields with multiple files use '.fields' method
exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();

    // 1) Cover image
    // We can use 'req.params.id' because the id will always be in the params on this route
    // We add to 'req.body.imageCover' so the next middleware can access and read it
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    // Remember it's an array even though it's a single image
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`./public/img/tours/${req.body.imageCover}`);

    // 2) Images
    // The tour schema expects an array of strings
    req.body.images = [];

    // Use 'Promise.all' to await the processing of all images so the code doesn't skip to the 'next' function before the filenames are written back
    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${
                i + 1
            }.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`./public/img/tours/${filename}`);

            req.body.images.push(filename);
        })
    );

    next();
});

// This alias amends the querystring before it reaches getAllTours function so that the query it receives contains the information below.
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

// Can return stats on particular fields of the data within MongoDB
exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                // Calculates the below on each tour difficulty and groups the data together.
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 }, // Add one each time a tour is passed through pipeline.
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            // Sort results in ascending order of 'avgPrice' - cheapest first
            $sort: { avgPrice: 1 }
        }
        /*
            {
                // Don't display any tour data for 'easy' tours
                $match: { _id: { $ne: 'EASY' } }, // $ne = not equal to
            },
            */
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            // unwind deconstructs an array field from the input documents and outputs one document for each element of the array
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`), // Set start date for data
                    $lte: new Date(`${year}-12-31`) // Set end date for data
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' }, // Relates to the month e.g. 10 = October
                numTourStarts: { $sum: 1 }, // How many tours start that month
                tours: { $push: '$name' } // Create array with all tour names that start in each month
            }
        },
        {
            $addFields: { month: '$_id' } // Create new field that matches '_id'
        },
        {
            $project: {
                _id: 0 // 0 will hide the field / 1 will show it
            }
        },
        {
            $sort: { numTourStarts: -1 } // Order the results by number of tours in descending order
        },
        {
            $limit: 12 // Limit the number of results returned
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
});

// Get tours based on distance from a specifed point on the globe
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    // Convert unit into 'radions' by dividing by the radius of the Earth in miles and kilometers
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next(
            new AppError(
                'Please provide the latitude and longitude in the format lat,lng.',
                400
            )
        );
    }
    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        status: 'success',
        data: {
            results: tours.length,
            data: tours
        }
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        next(
            new AppError(
                'Please provide the latitude and longitude in the format lat,lng.',
                400
            )
        );
    }
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance', // Name of field where calculated distances to be stored
                distanceMultiplier: multiplier // Converts distance to miles/km
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });
});

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' }); // Arguements: (Model, popOptions)
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
