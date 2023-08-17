module Api
  class UsersController < ApplicationController
    def create
      @user = User.new(user_params)

      if @user.save
        render 'api/users/create', status: :created
      else
<<<<<<< HEAD
        render_unsuccessful_response
=======
        render json: { success: false }, status: :bad_request
>>>>>>> 79166073fa557ebb8f4cc38527a299ebfa011400
      end
    end

    private

    def user_params
      params.require(:user).permit(:email, :password, :password_confirmation, :username)
    end
<<<<<<< HEAD

    def render_unsuccessful_response
      render json: { success: false }, status: :bad_request
    end
=======
>>>>>>> 79166073fa557ebb8f4cc38527a299ebfa011400
  end
end
