/* eslint-disable */
import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login', // Can use relative path as API & website are hosted in the same place
            data: {
                email,
                password
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout'
        });

        if (res.data.status === 'success') location.reload(true); //Forces reload from server, not browser
    } catch (err) {
        showAlert('error', 'Error logging out! Please try again.');
    }
};

export const forgotPassword = async (email) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/forgotPassword',
            data: {
                email
            }
        });

        if (res.data.status === 'success') {
            showAlert(
                'success',
                "Please check your email. We've sent you a link to reset your password."
            );
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const resetPassword = async (data) => {
    try {
        const url = `/api/v1/users/resetPassword/${data.token}`;
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Password reset successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
