const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
// const User = require('../../models/userModel');
// const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

// Access the MongoDB database path and replace the password variable in the string
console.log(process.env.DATABASE)
const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

// The settings added here are just to deal with deprecation warnings
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(() => console.log('DB connection successful!'));

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`), 'utf-8');
// const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`), 'utf-8');
// const reviews = JSON.parse(
//     fs.readFileSync(`${__dirname}/reviews.json`),
//     'utf-8'
// );

// IMPORT DATA TO THE DATABASE
const importData = async () => {
    try {
        // Can pass in an object to create multiple instnaces of 'Tour' model at once.
        await Tour.create(tours);
        // await User.create(users, { validateBeforeSave: false });
        // await Review.create(reviews);
        console.log('Data successfully loaded!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

// DELETE ALL DATA FROM DATABASE
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        // await User.deleteMany();
        // await Review.deleteMany();
        console.log('Data successfully deleted!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

console.log(process.argv);
// This shows the separate parts of the command: 'node dev-data/data/import-dev-data.js --import' e.g.
// [node,
// dev-data/data/import-dev-data.js,
// --import]
// So we can differentiate the callback function with the if statement below.

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
