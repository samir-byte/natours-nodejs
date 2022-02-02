const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');


//function to filter out unwanted fields
const filterObj = (obj, ...allowedFields) => {
    Object.keys(obj).forEach(el => {
        if(!allowedFields.includes(el)) delete obj[el]
    })
}


exports.getAllUsers = factory.getAll(User);
// exports.getAllUsers = catchAsync(async(req, res) => {
//     const users = await User.find();
//     res.status(200).json({
//         status: 'success',
//         users
//     });
// });

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsync(async(req, res, next) => {
    /*
    1) Create error if user POSTs password data
    2) Update user document with new data
    3) Send response
    */
   if(req.body.password || req.body.passwordConfirm){
       return next(new AppError('This route is not for password update', 400));
   }

   //filter out unwanted fields that are not allowed to be updated
   const filteredBody = filterObj(req.body, 'name', 'email');
   const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
         new: true,
         runValidators: true
   })
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
})

exports.deleteMe = catchAsync(async(req, res, next) => {
    /*
    1) Delete user document
    2) Send response
    */
    await User.findByIdAndUpdate(req.user.id, {active: false});
    res.status(204).json({
        status: 'success',
        data: null
    })
});
   

exports.getUser = factory.getOne(User);

exports.createUser = (req, res) => {

}

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
