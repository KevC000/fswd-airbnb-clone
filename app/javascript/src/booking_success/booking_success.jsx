import React from 'react';
import Layout from '@src/layout';

import './booking_success.scss';

class BookingSuccess extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            booking: null,
            property: null,
        };
    }

    componentDidMount() {
        // Get the second to last part of the URL path, which should be the booking ID.
        const pathParts = window.location.pathname.split('/');
        const id = pathParts[pathParts.length - 2];

        if (id) {
            fetch(`/api/bookings/${id}/success`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Network response was not ok.');
                    }
                })
                .then(data => {
                    this.setState({ booking: data.booking });
                    return fetch(`/api/properties/${data.booking.property_id}`);
                })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Network response was not ok.');
                    }
                })
                .then(data => this.setState({ property: data }))
                .catch(error => console.error('Error:', error));
        } else {
            console.error('Booking ID is undefined');
        }
    }


    render() {
        const { booking, property } = this.state;

        if (!booking || !property) {
            return <div>Loading...</div>;
        }

        return (
            <Layout>
                <div className="booking-success-container">
                    <h1>Booking Successful!</h1>
                    <p>Thank you for your booking. Your booking is being processed and you will receive a confirmation email shortly.</p>
                    <div className="booking-details">
                        <h2>Booking Details</h2>
                        <p><strong>Booking ID:</strong> {booking.id}</p>
                        <p><strong>Start Date:</strong> {booking.start_date}</p>
                        <p><strong>End Date:</strong> {booking.end_date}</p>
                        <p><strong>Property:</strong> {property.title}</p>
                        <p><strong>Paid:</strong> {booking.is_paid ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="confirmation-note">
                        <p>If you have any questions or need further assistance, please do not hesitate to contact us.</p>
                    </div>
                </div>
            </Layout>
        );
    }
}

export default BookingSuccess;
