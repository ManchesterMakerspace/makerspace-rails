Rails.application.routes.draw do

  unless Rails.env.production?
    mount OpenApi::Rswag::Ui::Engine => '/api-docs'
    mount OpenApi::Rswag::Api::Engine => '/api-docs'
  end

  root to: "application#application"
  post '/ipnlistener', to: 'paypal#notify'

  namespace :billing do
    post '/braintree_listener', to: 'braintree#webhooks'
  end

  scope :api, defaults: { format: :json } do
    devise_for :members, skip: [:registrations], controllers: { sessions: "sessions" }
    devise_scope :member do
       post "members", to: "registrations#create"
       post '/send_registration', to: 'registrations#new'
    end
    resources :invoice_options, only: [:index, :show]
    resources :client_error_handler, only: [:create]

    namespace :billing do
      resources :plans, only: [:index]
      resources :discounts, only: [:index]
    end

    authenticate :member do
      resources :members, only: [:show, :index, :update] do
        scope module: :members do
          resources :permissions, only: [:index]
        end
      end
      resources :rentals, only: [:show, :index, :update]
      resources :invoices, only: [:index, :create]

      resources :documents, only: [:show], defaults: { format: :html }

      namespace :billing do
        resources :payment_methods, only: [:new, :create, :show, :index, :destroy]
        resources :subscriptions, only: [:show, :update, :destroy]
        resources :transactions, only: [:create, :index, :destroy]
        resources :receipts, only: [:show], defaults: { format: :html }
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
        resources :analytics, only: [:index]

        namespace :billing do
          resources :subscriptions, only: [:index, :destroy]
          resources :transactions, only: [:show, :index, :destroy]
          resources :receipts, only: [:show], defaults: { format: :html }
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
