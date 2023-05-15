module Api
  class SessionsController < ApplicationController
    def create
      @user = User.find_by(username: params[:user][:username]) || User.find_by(email: params[:user][:email])
      puts "@user: #{@user.inspect}"

      if @user&.authenticate(params[:user][:password])
        session = @user.sessions.create
        puts "session: #{session.inspect}"

        cookies.permanent.signed[:airbnb_session_token] = {
          value: session.token,
          httponly: true
        }

        render 'api/sessions/create', status: :created
      else
        render json: { success: false }, status: :bad_request
      end
    end

    def authenticated
      token = cookies.signed[:airbnb_session_token]
      session = Session.find_by(token: token)

      if session
        @user = session.user
        render 'api/sessions/authenticated', status: :ok
      else
        render json: { authenticated: false }, status: :ok
      end
    end

    def destroy
      token = cookies.signed[:airbnb_session_token]
      session = Session.find_by(token: token)

      if session&.destroy
        cookies.delete(:airbnb_session_token)
        render json: { success: true }, status: :ok
      else
        render json: { success: false }, status: :unprocessable_entity
      end
    end
  end
end
