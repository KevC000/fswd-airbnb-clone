module Api
  class SessionsController < ApplicationController
    def create
      @user = find_user

      if @user&.authenticate(params[:user][:password])
        create_session_for_user
        render 'api/sessions/create', status: :created
      else
        render json: { success: false }, status: :bad_request
      end
    end

    def authenticated
      session = find_session

      if session
        @user = session.user
        render 'api/sessions/authenticated', status: :ok
      else
        render json: { authenticated: false }, status: :ok
      end
    end

    def destroy
      session = find_session

      if session&.destroy
        cookies.delete(:airbnb_session_token)
        render json: { success: true }, status: :ok
      else
        render json: { success: false }, status: :unprocessable_entity
      end
    end

    private

    def find_user
      User.find_by(username: params[:user][:username]) || User.find_by(email: params[:user][:email])
    end

    def create_session_for_user
      session = @user.sessions.create

      cookies.permanent.signed[:airbnb_session_token] = {
        value: session.token,
        httponly: true
      }
    end

    def find_session
      token = cookies.signed[:airbnb_session_token]
      Session.find_by(token: token)
    end
  end
end
