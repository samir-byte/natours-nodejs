const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

// This will run on every request that comes into the router
router.use(viewsController.alerts);

router.get('/', authController.isLoggedIn, viewsController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/signup', viewsController.getSignupForm);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/forgot-password', viewsController.getForgotPasswordForm);
router.get('/reset-password/:token', viewsController.getResetPasswordForm);
router.get('/me', authController.protect, viewsController.getAccount);

router.get(
    '/my-tours',
    //bookingController.createBookingCheckout,
    authController.protect,
    viewsController.getMyTours
);

router.get(
    '/my-reviews',
    authController.isLoggedIn,
    viewsController.getMyReviews
);

router.post(
    '/submit-user-data',
    authController.protect,
    viewsController.updateUserData
);

module.exports = router;
