class ApplicationController < ActionController::Base
  private

  def current_user
    token = cookies.signed[:airbnb_session_token]
    session = Session.find_by(token: token)

    @current_user ||= session.user if session
  end

  helper_method :current_user
end
