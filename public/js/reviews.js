/* eslint-disable */
import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alerts';

export const getReviewRating = (rating) => {
    let i;
    for (i = 0; i < rating.length; i++) {
        if (rating[i].checked) return rating[i].value;
    }
};

export const addReview = async (tour, rating, review) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/reviews',
            data: {
                tour,
                rating,
                review
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Review added!');
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const editReview = async (id, rating, review) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/reviews/${id}`,
            data: {
                id,
                rating,
                review
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Review updated!');
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const deleteReview = async (id) => {
    try {
        const res = await axios({
            method: 'DELETE',
            url: `/api/v1/reviews/${id}`,
            data: {
                id
            }
        });
        // console.log(res.status);
        if (res.status === 204) {
            showAlert('success', 'Review deleted. The page will automatically reload in a few seconds.');
            window.setTimeout(() => {
                location.assign('/my-reviews');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};