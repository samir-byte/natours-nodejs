const fs = require('fs')
const multer = require('multer')
const sharp = require('sharp')
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)) 
const Tour = require('./../models/tourModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')

// exports.checkId = (req, res, next, val) => {
//     console.log(req.params.id)
//     const tour = tours.find(el => el.id === parseInt(val))
//     if(!tour) return res.status(404).json({
//         status: 'fail',
//         message: 'Invalid ID'
//     })
//     next()
// }

// exports.checkData = (req, res, next) => {
//     // console.log(req)
//     if(req.name === undefined) return res.status(400).json({
//         status: 'fail',
//         message: 'Missing name'
//     })
//     next();
//     if(req.price === undefined) return res.status(400).json({
//         status: 'fail',
//         message: 'Missing price'
//     })
//     next();
// }

const multerStorage = multer.memoryStorage(); //saving image as buffer not in any local storage

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }
    else{
        cb(new AppError('Not an image! Please upload only images', 400), false)
    }
}
const upload = multer({ 
    storage: multerStorage,
    fileFilter: multerFilter 
})

exports.updateTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
])

exports.resizeTourImages = async (req, res, next) => {
    console.log(req.files)
    if(!req.files.imageCover || !req.files.images) return next();

    const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    
    // 1, processing cover image

    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`uploads/tours/${imageCoverFilename}`)

    //setting imageCover field in req.body
    req.body.imageCover = imageCoverFilename;

    // 2, processing images
    req.body.images = [];
    await Promise.all(req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(req.file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`uploads/tours/${filename}`)
        req.body.images.push(filename);
    }))
    
    next();
}

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}


exports.getAllTours = factory.getAll(Tour)
// exports.getAllTours = catchAsync (async (req, res, next) => {

//     const features = new APIFeatures(Tour.find(), req.query)
//                         .filter()
//                         .sort()
//                         .limitFields()
//                         .paginate();
//         console.log(features);
//         console.log("this is executed after features")
//         console.log(`this is executed after features ${features.query}`);
//         const tours = await features.query;
//         // console.log(tours);
//         res.status(200).json({
//         status: 'success',
//         data: tours,
//         requestTime: req.requestTime
    // try{
    //     console.log("this is executed");
    //     //1. FILTERING
    //     // const queryObj = {...req.query}
    //     // const excludedFields = ['page', 'sort', 'limit', 'fields']
    //     // excludedFields.forEach(el => delete queryObj[el])
    //     // console.log(req.requestTime);

    //     // let queryStr = JSON.stringify(queryObj);
    //     // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    //     // console.log(JSON.parse(queryStr));
        
    //     // let query = Tour.find(JSON.parse(queryStr))

    //     //2. SORTING
    //     // if(req.query.sort) {
    //     //     const sortBy = req.query.sort.split(',').join(' ')
    //     //     console.log(sortBy);
    //     //     query = query.sort(sortBy)
    //     // }
    //     // else{
    //     //     query = query.sort('-createdAt')
    //     // }

    //     //3. FIELDS LIMITING
    //     // if(req.query.fields){
    //     //     const fields = req.query.fields.split(',').join(' ')
    //     //     query = query.select(fields)
    //     // }
    //     // else{
    //     //     query = query.select('-__v')
    //     // }

    //     //4. PAGINATION
        
    //     // const page = req.query.page * 1 || 1
    //     // const per_page = req.query.limit * 1 || 5
    //     // const offset = (page - 1) * per_page
        

    //     // query = query.skip(offset).limit(per_page)
    //     // if(req.query.page){
           
    //     // }

        
    // })
    // }
    // catch(err){
    //     res.status(404).json({
    //         status: 'fail',
    //         message: err
    //     })
//     })
    
// })


exports.getTour = factory.getOne(Tour, {path: 'reviews'})
// exports.getTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findById(req.params.id).populate('reviews')
//     if(!tour){
//        return next(new AppError('No tour found with that ID', 404))
//     }
//         console.log(req.params);
//         res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     })
    // try{
        
    // })
    // }
    // catch(err){
    //     res.status(404).json({
    //         status: 'fail',
    //         message: err
    //     })
    // }
    
// })


exports.postTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
    
//     console.log(req.params);
        
//         await Tour.findByIdAndDelete(req.params.id)
//         res.status(204).json({
//             status: 'success',
//             data: null
//         })
//     // try{
        
//     // }
//     // catch(err){
//     //     res.status(404).json({
//     //         status: 'fail',
//     //         message: err
//     //     })
//     // }
// })

exports.getTourStats = catchAsync(async (req, res, next) => {
    
    const stats = await Tour.aggregate([
        { 
            $match: { ratingsAverage: { $gte:4.5 } }
        },
        {
            $group: {
                _id: '$difficulty',
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price'},
                minPrice: { $min: '$price'},
                maxPrice: { $max: '$price'}
            }
        },
        {
            $sort: { avgPrice: 1 }
        },
        // {
        //     $match: { _id: { $ne: 'easy' } }
        // }
    ])
    console.log(stats)
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })
    // try {
        
    // } catch (err) {
    //     res.status(404).json({
    //         status: 'fail',
    //         message: err
    //     })
    // }
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    
    const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: '$name' }
                }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: { numTourStarts: -1 }
            }
        ])

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
    });

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit} = req.params;
    const [lat,lng] = latlng.split(',');
 
    if(!lat || !lng){
        next(new AppError('Please provide latitude and longitude in the format lat,lng', 404))
    }
    console.log(distance, lat, lng);

    //if distance in mi distance/3963.2 if km distance/6378.1
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    });

    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: tours
    })
})

exports.getDistances = catchAsync(async (req, res, next) => {
    console.log(req.params);
    const { latlng, unit} = req.params;
    const [lat,lng] = latlng.split(',');
 
    if(!lat || !lng){
        next(new AppError('Please provide latitude and longitude in the format lat,lng', 404))
    }
    
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: unit === 'mi' ? 0.000621371 : 0.001
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: distances 
    })
})