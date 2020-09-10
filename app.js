// This file is only used to configure express

/**** CORE MODULES ****/
const path = require('path');
const express = require('express');

/**** 3RD PARTY MODULES ****/
const morgan = require('morgan'); // Morgan is used for logging
const rateLimit = require('express-rate-limit'); // Prevents too many requests to the API e.g DoS
const helmet = require('helmet'); // Set HTTP headers
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

/**** USER-CREATED MODULES ****/
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.enable('trust proxy');

// Set PUG as template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // Prevents bugs with '/' in the pathname

/**** GLOBAL MIDDLEWARE *****/
// These are middleware functions that will be run on all requests as no specific route has been declared.

// Serving static files on the web
app.use(express.static(path.join(__dirname, 'public')));

// Set HTTP headers
app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            fontSrc: ["'self'", 'https:', 'data:'],
            scriptSrc: [
                "'self'",
                'blob:',
                'https://api.mapbox.com/',
                'https://*.cloudflare.com/',
                'https://*.stripe.com/'
            ],
            //scriptSrcElem: ["'self'"],
            scriptSrcAttr: ["'none'"],
            frameSrc: ["'self'", 'https://*.stripe.com/'],
            imgSrc: ["'self'", 'data:'],
            workerSrc: ["'self'", 'data:', 'blob:'],
            connectSrc: ["'self'", 'blob:'],
            objectSrc: ["'none'"],
            styleSrc: ["'self'", 'https:', 'unsafe-inline'],
            upgradeInsecureRequests: [],
            blockAllMixedContent: []
        }
    })
);

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit number of API requests from the same IP
const limiter = rateLimit({
    max: 100, // Allows 100 requests from the same IP
    windowMs: 60 * 60 * 1000, // 1hr in ms
    message: 'Too many requests from this IP. Please try again in an hour.'
});
// Apply only to '/api' route
app.use('/api', limiter);

// Body parser, reading data from body into 'req.body'
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitisation against noSQL data injection
app.use(mongoSanitize()); // Filters out '$', '.' etc. from req.query, req.params & req.body

// Data sanitisation against XSS
app.use(xss()); // Cleans code from malicious HTML

// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price'
        ]
    })
);

app.use(compression());

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    //console.log(req.cookies);
    next();
});

/**** ROUTES *****/
// If the urls below are requested then it runs tourRouter/userRouter which will route the request depending on the method that was used.
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// If we can reach this stage then the req/res cycle was not completed as middleware added to the stack in the order it's defined in our code. This catches all bad queries.
// .all() includes every http method or verb (get, patch, update, delete) & '*' denotes everything or all routes
app.all('*', (req, res, next) => {
    // When you pass in an argument to next() function, express automatically recognises it as an error and skips other middleware functions moving directly to the error handling middleware.
    // Creates a new error based on 'AppError' class.
    next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// ERROR HANDLING MIDDLEWARE
// By specifying 'err' first express knows it's the error handling middleware.
app.use(globalErrorHandler);

module.exports = app;
