Rails.application.routes.draw do
  root to: 'static_pages#home'

  get '/property/add' => 'static_pages#add_property'
  get '/property/:id' => 'static_pages#property'
  get '/login' => 'static_pages#login'

  get '/property/:id/edit' => 'static_pages#edit_property'
  get '/bookings' => 'static_pages#bookings'
  get '/booking/:id/success' => 'static_pages#booking_success', as: 'booking_success'

  namespace :api do
    get 'env_vars', to: 'env_vars#show'

    resources :users, only: [:create]
    resources :sessions, only: %i[create destroy]
    resources :properties, only: %i[index show create update]
    resources :bookings, only: [:create] do
      post :start_checkout, on: :member
    end
    resources :charges, only: [:create]

    get '/properties/:id/bookings' => 'bookings#get_property_bookings'
    get '/authenticated' => 'sessions#authenticated'
    put '/properties/:id/update' => 'properties#update'
    post '/properties/create' => 'properties#create'
    get '/bookings/get_user_bookings' => 'bookings#get_user_bookings'
    get '/bookings/get_property_bookings_for_owner' => 'bookings#get_property_bookings_for_owner'
    post '/bookings/create' => 'bookings#create'
    get '/bookings/:id/success', to: 'bookings#booking_success', as: 'booking_success'
    get '/bookings' => 'bookings#index'
    delete '/bookings/:id/cancel', to: 'bookings#cancel', as: 'cancel_booking'
    get '/logout' => 'sessions#destroy'
    post '/login' => 'sessions#create'
    # stripe webhook
    post '/charges/mark_complete' => 'charges#mark_complete'
  end
end
