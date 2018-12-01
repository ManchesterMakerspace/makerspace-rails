Rails.application.routes.draw do

  root to: "application#application"
  post '/ipnlistener', to: 'paypal#notify'

  scope :api, defaults: { format: :json } do
    devise_for :members, skip: [:registrations]
    devise_scope :member do
       post "members", to: "registrations#create"
    end
    resources :invoice_options, only: [:index]

    authenticate :member do
      resources :members, only: [:show, :index, :update]
      resources :rentals, only: [:show, :index]
      resources :invoices, only: [:index]
      resources :groups, only: [:index]

      namespace :billing do
        resources :plans, only: [:index]
        resources :payment_methods, only: [:create, :index]
        resources :subscriptions, only: [:show, :update, :destroy]
      end

      namespace :admin  do
        resources :cards, only: [:new, :create, :index, :update]
        resources :invoices, only: [:index, :create, :update, :destroy]
        resources :invoice_options, only: [:create, :update, :destroy]
        resources :rentals, only: [:create, :update, :destroy, :index]
        resources :members, only: [:create, :update]
        namespace :billing do
          resources :subscriptions, only: [:index, :show, :update, :destroy]
        end
      end
    end

    namespace :billing do
      resources :checkout, only: [:new, :create]
    end
  end

  get '*path', to: 'application#application'
end
