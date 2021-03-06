const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    tour: {
        type: Schema.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'A booking must belong to a tour']
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A booking must belong to a user']
    },
    price: {
        type: Number,
        required: [true, 'A booking must have a price']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
})

//query middleware to populate
bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    });
})

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;