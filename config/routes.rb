Rails.application.routes.draw do

  root to: "application#angular"
  post '/ipnlistener', to: 'paypal#notify'

  scope :api, defaults: { format: :json } do
    resources :members, only: [:index]
    get 'members/contract', to: 'members#contract'
    resources :groups, only: [:index]
    resources :token, only: [:create]
    post '/token/:id/:token', to: 'token#validate'
    resources :rentals, only: [:index]
    resources :calendar, only: [:index, :update]

    devise_for :members, skip: [:registrations]
    devise_scope :member do
       post "members", to: "registrations#create"
    end

    authenticate :member do
      resources :members, only: [:show]
      resources :rentals, only: [:show]
      namespace :admin  do
        put 'members/renew/:id', to: 'members#renew'
        resources :cards, only: [:new, :create, :index, :update]
        resources :rentals, only: [:create, :update, :destroy]
        resources :members, only: [:create, :update]
      end
    end

    namespace :payment do
      resources :checkout, only: [:new, :create]
      resources :plans, only: [:index]
      resources :subscriptions, only: [:index]
      resources :customer, only: [:create]
    end
  end
end
