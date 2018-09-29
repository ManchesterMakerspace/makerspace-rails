Rails.application.routes.draw do

  root to: "application#application"
  post '/ipnlistener', to: 'paypal#notify'

  scope :api, defaults: { format: :json } do
    devise_for :members, skip: [:registrations]
    devise_scope :member do
       post "members", to: "registrations#create"
    end
    get "/invoices/options", to: "invoices#options"

    authenticate :member do
      resources :members, only: [:show, :index]
      resources :rentals, only: [:show, :index]
      resources :invoices, only: [:index]

      namespace :admin  do
        resources :cards, only: [:new, :create, :index, :update]
        resources :invoices, only: [:index, :create, :update, :destroy]
        resources :rentals, only: [:create, :update, :destroy, :index]
        resources :members, only: [:create, :update]
      end
    end

    namespace :billing do
      resources :checkout, only: [:new, :create]
      resources :plans, only: [:index]
      resources :subscriptions, only: [:index]
      resources :customer, only: [:create]
    end
  end

  get '*path', to: 'application#application'
end
