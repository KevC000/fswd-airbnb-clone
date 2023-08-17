module Api
  class ChargesController < ApplicationController
    skip_before_action :verify_authenticity_token, only: [:mark_complete]

    def create
      session = find_session
      return render_unauthorized unless session

      booking = find_booking
      return render_not_found('cannot find booking') unless booking

      stripe_session = create_stripe_session(booking)
      @charge = booking.charges.new({
                                      checkout_session_id: stripe_session.id,
                                      currency: 'usd',
                                      amount: calculate_booking_amount(booking)
                                    })

      if @charge.save
        render 'api/charges/create', status: :created
      else
        render_not_found('charge could not be created')
      end
    end

    def mark_complete
      event = stripe_event
      return head :bad_request unless event

      if event['type'] == 'checkout.session.completed'
        handle_checkout_completed(event)
      else
        head :bad_request
      end
    end

    private

    def find_session
      token = cookies.signed[:airbnb_session_token]
      Session.find_by(token: token)
    end

    def find_booking
      Booking.find_by(id: params[:booking_id])
    end

    def create_stripe_session(booking)
      property = booking.property
      Stripe::Checkout::Session.create(
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: "Trip for #{property.title}",
              description: "Your booking is for #{booking.start_date} to #{booking.end_date}."
            },
            unit_amount: (calculate_booking_amount(booking) * 100.0).to_i
          },
          quantity: 1
        }],
        mode: 'payment',
        success_url: "#{ENV['URL']}/booking/#{booking.id}/success",
        cancel_url: "#{ENV['URL']}#{params[:cancel_url]}"
      )
    end

    def calculate_booking_amount(booking)
      days_booked = (booking.end_date - booking.start_date).to_i
      days_booked * booking.property.price_per_night
    end

    def stripe_event
      sig_header = request.env['HTTP_STRIPE_SIGNATURE']
      payload = request.body.read
      endpoint_secret = ENV['STRIPE_MARK_COMPLETE_WEBHOOK_SIGNING_SECRET']

      Stripe::Webhook.construct_event(
        payload, sig_header, endpoint_secret
      )
    rescue JSON::ParserError, Stripe::SignatureVerificationError
      nil
    end

    def handle_checkout_completed(event)
      session = event['data']['object']
      charge = Charge.find_by(checkout_session_id: session.id)
      return head :bad_request unless charge

      charge.update({ complete: true })
      remove_unpaid_overlapping_bookings(charge.booking)
      head :ok
    end

    def remove_unpaid_overlapping_bookings(booking)
      overlapping_bookings = Booking.where(property_id: booking.property_id)
                                    .where("start_date < ? AND end_date > ?", booking.end_date, booking.start_date)
      unpaid_overlapping_bookings = overlapping_bookings.reject(&:is_paid?)
      unpaid_overlapping_bookings.each(&:destroy) if unpaid_overlapping_bookings.any?
    end

    def render_unauthorized
      render json: { error: 'user not logged in' }, status: :unauthorized
    end

    def render_not_found(message)
      render json: { error: message }, status: :not_found
    end
  end
end
