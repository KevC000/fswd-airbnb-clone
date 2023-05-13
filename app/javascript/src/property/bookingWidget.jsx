import React from 'react';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import { safeCredentials, handleErrors } from '@utils/fetchHelper';
import 'react-dates/lib/css/_datepicker.css';
import moment from 'moment';

class BookingWidget extends React.Component {
  state = {
    authenticated: false,
    existingBookings: [],
    startDate: null,
    endDate: null,
    focusedInput: null,
    loading: false,
    error: false,
  }

  isDayBlocked = day => {
    return this.state.existingBookings.some(booking => {
      const startDate = moment(booking.start_date);
      const endDate = moment(booking.end_date);
      return day.isSameOrAfter(startDate, 'day') && day.isBefore(endDate, 'day');
    });
  };


  componentDidMount() {
    fetch('/api/authenticated')
      .then(handleErrors)
      .then(data => {
        this.setState({
          authenticated: data.authenticated,
        });
      });

    fetch(`/api/bookings?property_id=${this.props.property_id}`)
      .then(response => response.json())
      .then(data => {
        console.log(data.bookings); // Add this line
        this.setState({ existingBookings: data.bookings || [] });
      });

  }

  submitBooking = (e) => {
    if (e) { e.preventDefault(); }
    const { startDate, endDate } = this.state;

    fetch(`/api/bookings`, safeCredentials({
      method: 'POST',
      body: JSON.stringify({
        booking: {
          property_id: this.props.property_id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }
      })
    }))
      .then(handleErrors)
      .then(response => {
        // Add the new booking to existingBookings
        this.setState(prevState => ({
          existingBookings: [...prevState.existingBookings, {
            start_date: startDate,
            end_date: endDate,
          }]
        }));
        return this.initiateStripeCheckout(response.booking.id);
      })
      .catch(error => {
        console.log(error);
      });
  }

  initiateStripeCheckout = (booking_id) => {
    return fetch(`/api/charges?booking_id=${booking_id}&cancel_url=${window.location.pathname}`, safeCredentials({
      method: 'POST',
    }))
      .then(handleErrors)
      .then(response => {
        const stripe = Stripe(process.env.STRIPE_PUBLISHABLE_KEY);

        stripe.redirectToCheckout({
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

  onDatesChange = ({ startDate, endDate }) => this.setState({ startDate, endDate })

  onFocusChange = (focusedInput) => this.setState({ focusedInput })

  render() {
    const { authenticated, startDate, endDate, focusedInput } = this.state;
    const { price_per_night } = this.props;

    if (!authenticated) {
      return (
        <div className="border p-4 mb-4">
          Please <a href={`/login?redirect_url=${window.location.pathname}`}>log in</a> to book.
        </div>
      );
    }

    let days;
    if (startDate && endDate) {
      days = endDate.diff(startDate, 'days');
    }

    return (
      <div className="border p-4 mb-4">
        <form onSubmit={this.submitBooking}>
          <h5>${price_per_night} <small>per night</small></h5>
          <hr />
          <div style={{ marginBottom: focusedInput ? '400px' : '2rem' }}>
            <DateRangePicker
              startDate={startDate} // momentPropTypes.momentObj or null,
              startDateId="start_date" // PropTypes.string.isRequired,
              endDate={endDate} // momentPropTypes.momentObj or null,
              endDateId="end_date" // PropTypes.string.isRequired,
              onDatesChange={this.onDatesChange}
              focusedInput={focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
              onFocusChange={this.onFocusChange} // PropTypes.func.isRequired,
              isDayBlocked={this.isDayBlocked} // block already booked dates
              numberOfMonths={1}
            />
          </div>
          {days && (
            <div className="d-flex justify-content-between">
              <p>Total</p>
              <p>${(price_per_night * days).toLocaleString()}</p>
            </div>
          )}
          <button type="submit" className="btn btn-large btn-danger btn-block">Book</button>
        </form>
      </div>
    )
  }
}

export default BookingWidget;