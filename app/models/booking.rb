class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :property
  has_many :charges

  validates :start_date, presence: true
  validates :end_date, presence: true
  validates :user, presence: true
  validates :property, presence: true

  before_validation :check_start_date_smaller_than_end_date
  before_validation :check_availability

  def is_paid?
    charges.exists?(complete: true)
  end

  private

  def check_start_date_smaller_than_end_date
    raise ArgumentError, 'start date cannot be larger than end date' if start_date > end_date
  end

  def check_availability
    overlapping_bookings = Booking.where(property_id: property_id)
                                  .where('start_date < ? AND end_date > ?', end_date, start_date)

    paid_overlapping_bookings = overlapping_bookings.select(&:is_paid?)

    if paid_overlapping_bookings.any?
      errors.add(:overlapping_dates, 'date range overlaps with a paid booking')
      throw(:abort)
    end
  end
end
