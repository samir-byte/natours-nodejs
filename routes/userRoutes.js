const express = require('express')
const router = express.Router();
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')

//signup and login routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

//forgot password and reset password routes
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updateMyPassword/:id', authController.protect, authController.updatePassword);

router.get('/me', authController.protect, userController.getMe, userController.getUser);

router.patch('/updateMe', authController.protect, userController.updateMe);

router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = router;