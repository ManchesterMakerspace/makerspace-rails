Rails.application.routes.draw do

  # get '/members/sign_up', to: 'members#index'
  # get '/members/password', to: 'members#index'

  root to: "application#angular"
  post '/ipnlistener', to: 'paypal#notify'

  scope :api do
    resources :members, only: [:index]
    resources :groups, only: [:index]
    resources :token, only: [:create]
    post '/token/:id/:token', to: 'token#validate'
    resources :rentals, only: [:index]
    devise_for :members, :controllers => {:sessions => 'sessions', :registrations => 'registrations'}

    authenticate :member do
      resources :members, only: [:show]
      resources :rentals, only: [:show]
      resources :workshops, only: [:show, :index] do
        resources :skills, only: [:index, :create, :update, :destroy]
        resources :members, only: [:edit, :update]
      end
      namespace :admin  do
        # post '/members/intro', to: 'members#intro'
        # get '/members/welcome_email', to: 'members#welcome_email'
        resources :payments, only: [:index, :update]
        resources :cards, only: [:new, :create, :show, :update]
        resources :rentals, only: [:create, :update, :destroy]
        resources :members, only: [:new, :create, :update, :intro]
        resources :workshops, only: [:create, :update, :destroy]
      end
      # get '/admin/renew', to: 'admin/members#renew'
      # get '/workshops/:id/check_role', to: 'workshops#check_role'
      # post '/workshops/:id/train', to: 'workshops#train'
      # get '/workshops/:id/retrain_all', to: 'workshops#retrain_all', as: :retrain_workshop
      # post '/workshops/:id/expert', to: 'workshops#make_expert'
    end
  end

  # resources :members, only: [:index]
  #
  # get '/members/mailer', to: 'members#mailer'
  # post '/members/search_by', to: 'members#search_by'

end
