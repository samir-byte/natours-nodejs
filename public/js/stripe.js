/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
    'pk_test_51HLz18K0qm0M1qCbXqAWtAflJI1StYOcKSgqqV38BcvUI5g6MUgdyCxCEFm6P4EsctDGla3Oh7dkjqFI48RqPb0D00ANFZ9mql'
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
