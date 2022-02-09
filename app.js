const path = require('path');
var express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp')
const compression = require('compression')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')
const bookingRouter = require('./routes/bookingRoutes')

var app = express()

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//Global Middlewares

//middleware helmet
app.use(helmet())

//middleware morgan for development
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//rate limiting middleware
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many requests from this IP, please try again in 15 minutes"
})

// Apply the rate limiting middleware to all requests
app.use('/api',limiter);

//body-parser middleware for req.body
app.use(express.json({limit: '10kb'}));

app.use(compression());

//prevents parameter pollution
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

//data sanitization middleware noSQL injection
app.use(mongoSanitize());

//data sanitization middleware against XSS
app.use(xss());



// app.use((req, res, next) => {
//     console.log('Hello from middleware')
//     next()
// })

//test middleware
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
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/booking', bookingRouter)

//restricting access to routes
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

//error handler
app.use(globalErrorHandler)

module.exports = app;

