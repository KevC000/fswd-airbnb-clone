json.booking do
  json.id @booking.id
  json.start_date @booking.start_date
  json.end_date @booking.end_date
  json.is_paid @booking.is_paid?
  json.property do
    json.id @booking.property.id
    json.title @booking.property.title
  end
  json.user do
    json.id @booking.user.id
    json.username @booking.user.username
  end
end
