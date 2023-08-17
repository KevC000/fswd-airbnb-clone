module Api
  class BookingsController < ApplicationController
    skip_before_action :verify_authenticity_token

    def create
      @booking = current_user.bookings.new(booking_params)

      if @booking.save
        render json: @booking, status: :created
      else
        render json: @booking.errors, status: :unprocessable_entity
      end
    end

    def index
      if params[:property_id]
        property = Property.find_by(id: params[:property_id])
        return render json: { error: 'cannot find property' }, status: :not_found unless property

        @bookings = property.bookings.where('end_date > ? ', Date.today)
      else
        @bookings = Booking.all
      end

      render 'api/bookings/index'
    end

    def get_user_bookings
      user = current_user
      bookings = Booking.where(user_id: user.id).includes(:property)

      render json: { bookings: bookings.as_json(include: { property: { include: :user } }) }, status: :ok
    end

    def get_property_bookings_for_owner
      user = current_user
      puts "Current user: #{user.inspect}"
      bookings = Booking.joins(:property).where(properties: { user_id: user.id }).includes(:user, :property)
<<<<<<< HEAD
      puts "Bookings: #{bookings.inspect}"
      render json: { bookings: bookings.as_json(include: { user: {}, property: { include: :user }}) }, status: :ok
    end

    
=======

      render json: { bookings: bookings.as_json(include: { user: {}, property: { include: :user } }) }, status: :ok
    end

>>>>>>> 79166073fa557ebb8f4cc38527a299ebfa011400
    def booking_success
      booking = Booking.find(params[:id])
      render json: { booking: booking }
    end

    def start_checkout
      @booking = Booking.find_by(id: params[:id])

      return render json: { error: 'Booking not found' }, status: :not_found unless @booking

      property = @booking.property

      success_url = success_url = booking_success_url(@booking.id)
      cancel_url = bookings_url

      session = Stripe::Checkout::Session.create(
        payment_method_types: ['card'],
        mode: 'payment', # Add this line
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: property.title
            },
            unit_amount: (property.price_per_night * (@booking.end_date - @booking.start_date).to_i * 100).to_i # Multiply the price per night by the number of nights
          },
          quantity: 1
        }],
        success_url: success_url,
        cancel_url: cancel_url
      )

      @booking.update(checkout_session_id: session.id)

      render json: { checkout_url: session.url }, status: :ok
    end

    def cancel
      booking = Booking.find(params[:id])
      return render json: { error: 'booking not found' }, status: :not_found unless booking

      booking.charges.destroy_all
      booking.destroy

      render json: { message: 'booking cancelled' }, status: :ok
    end

    private

    def booking_params
      params.require(:booking).permit(:property_id, :start_date, :end_date)
    end
  end
end
