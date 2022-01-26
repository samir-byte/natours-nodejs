const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
var jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
var bcrypt = require('bcryptjs');
// const changedPasswordAfter = require('./../models/userModel')

const signToken = id => {
    return jwt.sign({id : id}, jwtSecret, {
        expiresIn: '1h'
    });
}

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    const token = signToken(newUser._id)
    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
})

exports.login = catchAsync(async(req, res, next) => {
    // const email = req.body.email;
    // const password = req.body.password;
    console.log("this is executing")
    const {email, password} = req.body
    //check if email and password exist

    if(!email || !password){
        return next(new AppError('Please provide email and password', 400));
    }
    const user = await User.findOne({email: email}).select('+password');
    if(!user){
        return next(new AppError('User doesnot exist', 401));
    }
    //check if password is correct
    if(user){
        const isMatched = await bcrypt.compare(password, user.password);
        // console.log(hashedPassword);
        // console.log(user.password);
        if(isMatched){
            const token = signToken(user._id)
            res.status(200).json({
                status: 'success',
                token
            })
        }
        else{
            return next(new AppError('Password is incorrect', 401));
        }
    }
})

exports.protect = catchAsync(async(req, res, next) => {
    // 1) Getting token and check of it's there
    const token = req.headers.authorization;
    if(!token){
        return next(new AppError('You are not logged in', 401));
    }
    // 2) Verification token
    const decoded = await jwt.verify(token, jwtSecret);
    console.log(decoded);
    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if(!user){
        return next(new AppError('User does not exist', 401));
    }
    // 4) Check if user changed password after the token was issued

    if(user.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password! Please log in again', 401));
    }
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = user;
    next();
})