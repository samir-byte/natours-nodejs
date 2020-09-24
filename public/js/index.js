/* eslint-disable */
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';
import { signup } from './signup';
import {
    getReviewRating,
    addReview,
    editReview,
    deleteReview
} from './reviews';

// DOM Elements
const mapBox = document.getElementById('map');
const signupForm = document.querySelector('.form--signup');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const newTourReview = document.querySelector('.reviews__rating--new-tour');
const reviewForm = document.querySelector('.form--review');
const reviewsStar = document.querySelectorAll('.reviews__star');
const editReviewForm = document.querySelectorAll('.form--edit-review');
const editReviewClose = document.querySelectorAll('.review__close');
const editReviewBtn = document.querySelectorAll('.btn--edit-review');
const deleteReviewBtn = document.querySelectorAll('.btn--delete-review');
const bookBtn = document.getElementById('book-tour');

// Delegation
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm')
            .value;
        signup(name, email, password, passwordConfirm);
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stops the form performing other actions
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

if (userDataForm) {
    userDataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        // As we only have a single file that can be uploaded we need to select the first element in the array
        form.append('photo', document.getElementById('photo').files[0]);
        updateSettings(form, 'data');
    });
}

if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent =
            'Updating...';

        const passwordCurrent = document.getElementById('password-current')
            .value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm')
            .value;
        await updateSettings(
            { passwordCurrent, password, passwordConfirm },
            'password'
        );
        document.querySelector('.btn--save-password').textContent =
            'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}

if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const tour = reviewForm.dataset.tourId;
        const ratingElement = document.getElementsByName('rating');
        const rating = getReviewRating(ratingElement);
        const review = document.getElementById('review').value;
        addReview(tour, rating, review);
    });
}

// Fills the svg star icons depending on the rating selected by the user
if (reviewsStar) {
    reviewsStar.forEach((star) => {
        star.addEventListener('click', (e) => {
            const ratingId = star.dataset.ratingId;

            const stars = newTourReview
                ? document.getElementsByName('rating')
                : document.getElementsByName(ratingId);

            const starSvgs = [];
            for (let i = 0; i < stars.length; i++) {
                const svg =
                    stars[i].nextElementSibling.firstElementChild
                        .firstElementChild;
                starSvgs.push(svg);
            }

            const clickedStarValue = e.target.closest('label')
                .previousElementSibling.value;

            starSvgs.forEach((svg) => {
                const starValue = svg.closest('label').previousElementSibling
                    .value;

                if (clickedStarValue >= starValue) {
                    svg.classList.remove('reviews__star--active');
                    svg.classList.remove('reviews__star--inactive');
                    svg.classList.add('reviews__star--active');
                } else {
                    svg.classList.remove('reviews__star--active');
                    svg.classList.remove('reviews__star--inactive');
                    svg.classList.add('reviews__star--inactive');
                }
            });
        });
    });
}

if (editReviewBtn) {
    editReviewBtn.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.target
                .closest('.card__details')
                .classList.toggle('review__edit--hide');
            e.target.parentElement.nextElementSibling.classList.toggle(
                'review__write--hide'
            );
        });
    });
}

if (editReviewClose) {
    editReviewClose.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.target.parentElement.previousElementSibling.classList.toggle(
                'review__edit--hide'
            );
            e.target
                .closest('.review__write')
                .classList.toggle('review__write--hide');
        });
    });
}

if (editReviewForm) {
    editReviewForm.forEach((form) => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const reviewId = e.target.closest('form').dataset.reviewId;
            const ratingElement = document.getElementsByName(
                `rating-${reviewId}`
            );
            const rating = getReviewRating(ratingElement);
            const review = document.getElementById(`review-ta-${reviewId}`)
                .value;
            editReview(reviewId, rating, review);
        });
    });
}

if (deleteReviewBtn) {
    deleteReviewBtn.forEach((btn) => {
        btn.addEventListener('click', () => {
            const reviewId = btn.id.split('-')[1];
            const confirmDelete = confirm("Are you sure you want to delete this review?");
            if (confirmDelete) deleteReview(reviewId); 
        });
    });
}

if (bookBtn) {
    bookBtn.addEventListener('click', (e) => {
        e.target.textContent = 'Processing...';
        const { tourId } = e.target.dataset;
        bookTour(tourId);
    });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 15);
