const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a name.']
    },
    email: {
        type: String,
        required: [true, 'A user must have an email address.'],
        unique: [true, 'This email address is already in use.'],
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'A user must create a password.'],
        minlength: [8, 'Your password must contain at least 8 characters.'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [
            true,
            'This password does not match. Please check and try again'
        ],
        // This ONLY works on 'create' & 'save'!!
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords do not match!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function (next) {
    // Only run this function is password was modified.
    if (!this.isModified('password')) return next();

    // Hash the password with a cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Remove 'passwordConfirm' by setting it to undefined so it's not saved in DB.
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000; // In case saving to DB is slow we minus 1s
    next();
});

// Query middleware to catch queries beginning with 'find' and apply rules before passing on.
userSchema.pre(/^find/, function (next) {
    // 'this' points to current query
    this.find({ active: { $ne: false } });
    next();
});

// This is an instance method so is available on all the 'user' documents. Returns 'true' if PWs match.
userSchema.methods.correctPassword = async function (
    candidatePassword, // Original password user entered
    userPassword // Encrypted/hashed password
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        // Was the password changed after the token was created? True if yes, False if no.
        return JWTTimestamp < changedTimestamp;
    }
    // False means NOT changed.
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    // Create the reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Encrypt token and prepare for the client
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10mins

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
