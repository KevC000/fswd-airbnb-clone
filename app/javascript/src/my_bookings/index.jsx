// index.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import MyBookings from './my_bookings';

document.addEventListener('DOMContentLoaded', () => {

    ReactDOM.render(
        <MyBookings />,
        document.body.appendChild(document.createElement('div')),
    )
})