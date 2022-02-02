const fs = require('fs')
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)) 
const Tour = require('./../models/tourModel')
const APIFeatures = require('../utils/apiFeatures')
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

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTours = catchAsync (async (req, res, next) => {

    const features = new APIFeatures(Tour.find(), req.query)
                        .filter()
                        .sort()
                        .limitFields()
                        .paginate();
        console.log(features);
        console.log("this is executed after features")
        console.log(`this is executed after features ${features.query}`);
        const tours = await features.query;
        // console.log(tours);
        res.status(200).json({
        status: 'success',
        data: tours,
        requestTime: req.requestTime
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
    })
    
})

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews')
    if(!tour){
       return next(new AppError('No tour found with that ID', 404))
    }
        console.log(req.params);
        res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
    // try{
        
    // })
    // }
    // catch(err){
    //     res.status(404).json({
    //         status: 'fail',
    //         message: err
    //     })
    // }
    
})


exports.postTour = catchAsync(async (req, res, next) => {
    // const newId = tours[tours.length - 1].id + 1
    // const newTour = Object.assign({id: newId}, req.body)
    // tours.push(newTour)
    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    //     res.status(201).json({
    //         status: 'success',
    //         data: {
    //             tour: newTour
    //         }
    //     })
    // })

    //fn function in catchAsync is this function
    const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })

    // try{
        
    // }
    // catch(err){
    //     res.status(400).json({
    //         status: 'fail',
    //         message: err
    //     })
    // }
    
})

exports.updateTour = factory.updateOne(Tour)

exports.deleteTour = factory.deleteOne(Tour)
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