module Api
  class ChargesController < ApplicationController
    skip_before_action :verify_authenticity_token, only: [:mark_complete]
    def create
      token = cookies.signed[:airbnb_session_token]
      session = Session.find_by(token: token)
      return render json: { error: 'user not logged in' }, status: :unauthorized unless session
    
      booking = Booking.find_by(id: params[:booking_id])
      return render json: { error: 'cannot find booking' }, status: :not_found unless booking
    
      property = booking.property
      days_booked = (booking.end_date - booking.start_date).to_i
      amount = days_booked * property.price_per_night
    
      stripe_session = Stripe::Checkout::Session.create(
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: "Trip for #{property.title}",
              description: "Your booking is for #{booking.start_date} to #{booking.end_date}."
            },
            unit_amount: (amount * 100.0).to_i, # amount in cents
          },
          quantity: 1
        }],
        mode: 'payment',  # add this line
        success_url: "#{ENV['URL']}/booking/#{booking.id}/success",
        cancel_url: "#{ENV['URL']}#{params[:cancel_url]}"
      )
    
      @charge = booking.charges.new({
                                      checkout_session_id: stripe_session.id,
                                      currency: 'usd',
                                      amount: amount
                                    })
    
      if @charge.save
        render 'api/charges/create', status: :created
      else
        render json: { error: 'charge could not be created' }, status: :bad_request
      end
    end
    
    def mark_complete
      endpoint_secret = ENV['STRIPE_MARK_COMPLETE_WEBHOOK_SIGNING_SECRET']
    
      event = nil
      begin
        sig_header = request.env['HTTP_STRIPE_SIGNATURE']
        payload = request.body.read
        event = Stripe::Webhook.construct_event(
          payload, sig_header, endpoint_secret
        )
      rescue JSON::ParserError => e
        # Invalid payload
        return head :bad_request
      rescue Stripe::SignatureVerificationError => e
        # Invalid signature
        return head :bad_request
      end
    
      # Handle the checkout.session.completed event
      if event['type'] == 'checkout.session.completed'
        session = event['data']['object']
    
        # Fulfill the purchase, mark related charge as complete
        charge = Charge.find_by(checkout_session_id: session.id)
        return head :bad_request unless charge
    
        charge.update({ complete: true })
    
        # Remove any unpaid, overlapping bookings now that checkout is complete
        booking = charge.booking
        overlapping_bookings = Booking.where(property_id: booking.property_id)
                                      .where("start_date < ? AND end_date > ?", booking.end_date, booking.start_date)
        unpaid_overlapping_bookings = overlapping_bookings.reject { |booking| booking.is_paid? }
        unpaid_overlapping_bookings.each(&:destroy) if unpaid_overlapping_bookings.any?
    
        return head :ok
      end
    
      head :bad_request
    end    
  end
end