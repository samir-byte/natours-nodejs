const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        // To allow for nested GET reviews on tour (hack)
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };
        /**  EXECUTE QUERY **/
        // 'features' allows us to access all the methods in the feature class to use on the query.
        // Create new object of the APIFeatures class passing in a query object & querystring from express. Each of the methods from the class manipulates the query which is stored at features.query
        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        // Await features.query while it is being modified by the above steps.
        // const doc = await features.query.explain();
        const doc = await features.query;

        /*
        // Alternative method of writing out the same as above using Mongoose functions
        const query = Model.find()
            .where('duration')
            .equals(5)
            .where('difficulty')
            .equals('easy');
        */

        /**  SEND RESPONSE **/
        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc
            }
        });
    });

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        // Call the 'create' method on the model using async await. 'req.body' is the data we want to pass to the database.
        const doc = await Model.create(req.body);
        // 201 code means 'written'
        res.status(201).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    });

exports.getOne = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        // 'id' is based on the param specified in 'xxxxRoutes.js'
        // Below is shorthand for: Model.findOne({ _id: req.param.id })
        let query = Model.findById(req.params.id);
        if (popOptions) query = query.populate(popOptions);
        const doc = await query;

        if (!doc) {
            return next(new AppError('No document with that ID.', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            // Ensure the updated information is returned
            new: true,
            runValidators: true
        });

        if (!doc) {
            return next(new AppError('No document with that ID.', 404));
        }

        res.status(200).json({
            status: 'success',
            data: doc
        });
    });

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError('No document found with that ID.', 404));
        }

        // 204 is 'no content'
        res.status(204).json({
            status: 'success',
            data: null
        });
    });
