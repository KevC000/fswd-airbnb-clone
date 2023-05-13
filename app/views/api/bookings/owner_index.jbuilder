json.bookings do
    json.array! @bookings do |booking|
      json.id booking.id
      json.start_date booking.start_date
      json.end_date booking.end_date
      json.is_paid booking.is_paid?
      json.user do
        json.id booking.user.id
        json.name booking.user.name
      end
      json.property do
        json.id booking.property.id
        json.name booking.property.name
      end
    end
  end
  