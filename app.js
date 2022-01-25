var express = require('express')
const morgan = require('morgan')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

var app = express()

//Middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`))

// app.use((req, res, next) => {
//     console.log('Hello from middleware')
//     next()
// })

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

// app.get('/api/v1/tours', getAllTours)
// app.get('/api/v1/tours/:id', getTour)
// app.post('/api/v1/tours', postTour)
// app.patch('/api/v1/tours/:id', updateTour)
// app.delete('/api/v1/tours/:id', deleteTour)

//Routes
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server`
    // })
    // const err = new Error(`Can't find ${req.originalUrl} on this server`)
    // err.status = 'fail';
    // err.statusCode = 404;
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)) //passing the error to the next middleware this skip all middleware and go to the error handler
})

app.use(globalErrorHandler)

module.exports = app;

