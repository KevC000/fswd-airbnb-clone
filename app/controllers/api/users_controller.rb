module Api
  class UsersController < ApplicationController
    def create
      @user = User.new(user_params)

      if @user.save
        render 'api/users/create', status: :created
      else
        render_unsuccessful_response
      end
    end

    private

    def user_params
      params.require(:user).permit(:email, :password, :password_confirmation, :username)
    end

    def render_unsuccessful_response
      render json: { success: false }, status: :bad_request
    end
  end
end
