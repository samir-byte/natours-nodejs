const mongoose = require('mongoose')
var bcrypt = require('bcryptjs');
const validator = require('validator')
const { Schema } = mongoose;

//name, email, photo, password, passwordConfirm

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name'],
        trim: true,
        maxlength: [100, 'Name must be less or equal then 100 characters'],
        minlength: [2, 'Name must be more or equal then 2 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            //this only works on save() and create()
            validator: function(el){
                return el === this.password
            },
            message: 'Passwords are not the same'
        }
    },
    passwordChangedAt: Date
})

userSchema.pre('save', async function(next){
    //only run this function if password was actually modified
    if(!this.isModified('password')) return next();

    //hash password
    this.password = await bcrypt.hash(this.password, 12);

    //delete passwordConfirm
    this.passwordConfirm = undefined;
    next();
})

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
