/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
    'pk_test_51KQqXwFdtUbjPIhd8WxQX40rZglpVD0usRytF3gbQeTIqDNGcABUYtdq6VhFjqWj6QoYk9VzQsfCObIbi6YfDIhg00htvDg5FP'
);

export const bookTour = async (tourId) => {
    try {
        // 1) Get checkout session from API
    const session = await axios(
        `/api/v1/bookings/checkout-session/${tourId}`
    );

    // 2) Create checkout form and charge credit card
    await stripe.redirectToCheckout({
        // This is based on the object axios creates holding the session data
        sessionId: session.data.session.id
    });

    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};
