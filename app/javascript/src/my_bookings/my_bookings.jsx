import React from 'react';
import ReactDOM from 'react-dom';
import Layout from '@src/layout';
import { handleErrors } from '@utils/fetchHelper';
import './my_bookings.scss';


class MyBookings extends React.Component {
  state = {
    userBookings: [],
    propertyBookings: [],
    loading: true,
  }

  componentDidMount() {
    Promise.all([
      fetch('/api/bookings/get_user_bookings').then(handleErrors),
      fetch('/api/bookings/get_property_bookings_for_owner').then(handleErrors),
    ]).then(([userBookingsData, propertyBookingsData]) => {
      console.log(userBookingsData, propertyBookingsData);
      this.setState({
        userBookings: userBookingsData.bookings,
        propertyBookings: propertyBookingsData.bookings,
        loading: false,
      });
    })
      .catch(error => {
        console.log(error);
      });
  }

  startCheckout = (bookingId) => {

    const getMetaContent = (name) => {
      const element = document.querySelector(`meta[name="${name}"]`);
      return element && element.getAttribute('content');
    }

    const csrfToken = getMetaContent('csrf-token');

    fetch(`/api/bookings/${bookingId}/start_checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,  // add this line
      },
    })
      .then(handleErrors)
      .then(response => {
        // this is where you would redirect to the payment gateway or handle the payment process
        window.location.href = response.checkout_url;
      })
      .catch(error => console.log(error));
  }

  cancelBooking = (bookingId) => {
    const getMetaContent = (name) => {
      const element = document.querySelector(`meta[name="${name}"]`);
      return element && element.getAttribute('content');
    }

    const csrfToken = getMetaContent('csrf-token');

    fetch(`/api/bookings/${bookingId}/cancel`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,  // add this line
      },
    })
      .then(handleErrors)
      .then(response => {
        // Filter out the cancelled booking
        const updatedBookings = this.state.userBookings.filter(booking => booking.id !== bookingId);
        this.setState({ userBookings: updatedBookings });
      })
      .catch(error => console.log(error));
  }


  render() {
    const { userBookings, propertyBookings, loading } = this.state;

    if (loading) {
      return <div>Loading...</div>;
    }

    return (
      <Layout>
        <div className="bookings-container">
          <div className="user-bookings">
            <h1>My Bookings</h1>
            {userBookings.map(booking => (
              <div key={booking.id}>
                <p>Property: {booking.property.title}</p>
                <p>Owner: {booking.property.user.username}</p>
                <p>Start Date: {booking.start_date}</p>
                <p>End Date: {booking.end_date}</p>
                <p>Paid: {booking.is_paid ? "Yes" : "No"}</p>
                {!booking.is_paid && (
                  <div>
                    <button onClick={() => this.startCheckout(booking.id)} className="btn btn-large btn-danger btn-block mx-3">Start Checkout</button>
                    <button onClick={() => this.cancelBooking(booking.id)} className="btn btn-large btn-danger btn-block mx-3">Cancel Booking</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="property-bookings">
            <h1>My Property Bookings</h1>
            {propertyBookings.map(booking => (
              <div key={booking.id}>
                <p>Property: {booking.property.title}</p>
                <p>Booked by: {booking.user.username}</p>
                <p>Start Date: {booking.start_date}</p>
                <p>End Date: {booking.end_date}</p>
                <p>Paid: {booking.is_paid ? "Yes" : "No"}</p>
                {!booking.is_paid && (
                  <button onClick={() => this.cancelBooking(booking.id)} className="btn btn-large btn-danger btn-block mx-3">Cancel Booking</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }
}

export default MyBookings;
