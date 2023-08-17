class StaticPagesController < ApplicationController
  def home
    render 'home'
  end

  def property
    @data = { property_id: params[:id] }.to_json
    render 'property'
  end

  def login
    render 'login'
  end

  def edit_property
    @data = { property_id: params[:id] }.to_json
    render 'edit_property'
  end

  def add_property
    render 'add_property'
  end

  def bookings
    render 'my_bookings'
  end

  def booking_success
    render 'booking_success'  # this should match the name of your BookingSuccess view file
  end
end
