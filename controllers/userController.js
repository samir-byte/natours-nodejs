const multer  = require('multer')
const sharp = require('sharp');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

//don't save to disk original file save after resizing
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/')
//     },
//     filename: function (req, file, cb) {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//       }
// })
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

exports.uploadUserPhoto = upload.single('photo');

//resizing user photo middleware
exports.resizeUserPhoto = async (req, res, next) => {
    if(!req.file) return next();

    //giving file name which is used in our next handler function
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`uploads/${req.file.filename}`)
    next();
}

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
//    const filteredBody = filterObj(req.body, 'name', 'email');
   console.log(req.file);
//    console.log(filteredBody);
   const updateObj = {
        name: req.body.name
        
   }
   if(req.file) updateObj.photo = req.file.filename
   const updatedUser = await User.findByIdAndUpdate(req.user.id, updateObj, {
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
