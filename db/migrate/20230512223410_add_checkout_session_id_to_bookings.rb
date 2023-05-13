class AddCheckoutSessionIdToBookings < ActiveRecord::Migration[6.1]
  def change
    add_column :bookings, :checkout_session_id, :string
  end
end
