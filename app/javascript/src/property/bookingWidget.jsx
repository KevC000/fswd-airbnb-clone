// bookingWidget.jsx
import React from 'react';
import { safeCredentials, handleErrors } from '@utils/fetchHelper';

class BookingWidget extends React.Component {
  state = {
    authenticated: false,
    loading: false,
    error: false,
  }

  componentDidMount() {
    fetch('/api/authenticated')
      .then(handleErrors)
      .then(data => {
        this.setState({
          authenticated: data.authenticated,
        })
      })
  }

  initiateStripeCheckout = (booking_id) => {
    return fetch(`/api/charges?booking_id=${booking_id}&cancel_url=${window.location.pathname}`, safeCredentials({
      method: 'POST',
    }))
      .then(handleErrors)
      .then(response => {
        const stripe = Stripe(`${process.env.STRIPE_PUBLISHABLE_KEY}`);
  
        stripe.redirectToCheckout({
          // Make the id field from the Checkout Session creation API response
          // available to this file, so you can provide it as parameter here
          // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
          sessionId: response.charge.checkout_session_id,
        }).then((result) => {
          // If `redirectToCheckout` fails due to a browser or network
          // error, display the localized error message to your customer
          // using `result.error.message`.
        });
      })
      .catch(error => {
        console.log(error);
      })
  }

  submitBooking = (e) => {
    if (e) { e.preventDefault(); }
    const { startDate, endDate } = this.state;
    console.log(startDate.format('MMM DD YYYY'), endDate.format('MMM DD YYYY'));
  
    fetch(`/api/bookings`, safeCredentials({
      method: 'POST',
        body: JSON.stringify({
          booking: {
            property_id: this.props.property_id,
            start_date: startDate.format('MMM DD YYYY'),
            end_date: endDate.format('MMM DD YYYY'),
          }
        })
    }))
      .then(handleErrors)
      .then(response => {
        return this.initiateStripeCheckout(response.booking.id)
      })
      .catch(error => {
        console.log(error);
      })
  }

  render () {
    const { authenticated } = this.state;
    if (!authenticated) {
      return (
        <div className="border p-4 mb-4">
          Please <a href={`/login?redirect_url=${window.location.pathname}`}>log in</a> to make a booking.
        </div>
      );
    };

    const { price_per_night } = this.props;

    return (
      <div className="border p-4 mb-4">
        <form onSubmit={this.submitBooking}>
          <h5>${price_per_night} <small>per night</small></h5>
          <hr/>
          <p>date selection</p>
          <button type="submit" className="btn btn-large btn-danger btn-block">Book</button>
        </form>
      </div>
    )
  }
}

export default BookingWidget;