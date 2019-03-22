Rails.application.routes.draw do

  root to: "application#application"
  post '/ipnlistener', to: 'paypal#notify'

  scope :api, defaults: { format: :json } do
    devise_for :members, skip: [:registrations]
    devise_scope :member do
       post "members", to: "registrations#create"
       post '/send_registration', to: 'registrations#new'
    end
    resources :invoice_options, only: [:index]

    authenticate :member do
      resources :members, only: [:show, :index, :update]
      resources :rentals, only: [:show, :index]
      resources :invoices, only: [:index, :create]
      resources :permissions, only: [:show]

      namespace :billing do
        resources :plans, only: [:index]
        resources :payment_methods, only: [:new, :create, :index, :destroy]
        resources :subscriptions, only: [:show, :update, :destroy]
        resources :transactions, only: [:create]
        get '/plans/discounts', to: "plans#discounts"
      end

      resources :earned_memberships, only: [:show] do
        scope module: :earned_memberships do
          resources :reports, only: [:index, :create]
        end
      end

      namespace :admin  do
        resources :cards, only: [:new, :create, :index, :update]
        resources :invoices, only: [:index, :create, :update, :destroy]
        resources :invoice_options, only: [:create, :update, :destroy]
        resources :rentals, only: [:create, :update, :destroy, :index]
        resources :members, only: [:create, :update]
        resources :permissions, only: [:index, :update]
        namespace :billing do
          resources :subscriptions, only: [:index, :destroy]
        end

        resources :earned_memberships, only: [:index, :show, :create, :update] do
          scope module: :earned_memberships do
            resources :reports, only: [:index]
          end
        end
      end
    end
  end

  get '*path', to: 'application#application'
end
