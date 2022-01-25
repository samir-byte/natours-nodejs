const mongoose = require('mongoose')
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

process.on('uncaughtException', err => {
    // console.log(err.name);
    console.log(err.message);
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
    process.exit(1);

})

console.log(process.env.NODE_ENV);

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    console.log('DB connection successful');
})

// const testTour = new Tour({
//     name: 'The Forest Hiker',
//     duration: 5,
//     maxGroupSize: 15,
//     difficulty: 'easy',
//     ratingsAverage: 4.5,
//     ratingsQuantity: 5,
//     price: 100,
//     summary: 'This is a tour about hiking in the forest',
//     description: 'This is a tour about hiking in the forest',
//     imageCover: 'https://images.unsplash.com/photo-1583202978409-e6f9a8d3f7e0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
//     images: [
//         'https://images.unsplash.com/photo-1583202978409-e6f9a8d3f7e0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
//         'https://images.unsplash.com/photo-1583202978409-e6f9a8d3f7e0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
//         'https://images.unsplash.com/photo-1583202978409-e6f9a8d3f7e0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60'],
//     startDates: [
//         "2021-12-16,10:00",
//         "2022-01-16,10:00",
//         "2022-12-12,10:00"
//     ]
// });
// testTour.save().then(doc => {
//     console.log(doc);
// }).catch(err => {
//     console.log(err);
// })

const port = process.env.PORT || 3000;
//Server start
const server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
});


process.on('unhandledRejection', err => {
    console.log(err.name);
    console.log(err.message);
    console.log('UNHANDLED REJECTION! Shutting down...');
    //CLOSE SERVER AT FIRST SO THAT ALL PENDING TASKS ARE COMPLETED AND PROCESS EXITS GRACEFULLY
    server.close(() => {
        process.exit(1);
    }); 
})



// console.log(x)