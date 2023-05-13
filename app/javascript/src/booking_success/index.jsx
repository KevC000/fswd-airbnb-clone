import React from 'react';
import ReactDOM from 'react-dom';
import BookingSuccess from './booking_success';

document.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <BookingSuccess />,
        document.body.appendChild(document.createElement('div')),
    )
});
