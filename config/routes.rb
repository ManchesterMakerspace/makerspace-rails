Rails.application.routes.draw do

  devise_for :members, :controllers => {:confirmations => 'confirmations'}
  root to: "members#index"

  resources :members, only: [:index]

  authenticate :member do
    resources :members, only: [:show]
    resources :skills, only: [:edit, :destroy]
    resources :workshops, except: [:new, :create] do
      resources :skills, only: [:new, :create, :edit, :update, :destroy]
      resources :members, only: [:show, :edit, :update]
    end
    namespace :admin  do
      resources :members, only: [:new, :show, :edit, :update]
      resources :workshops, only: [:new, :create, :edit, :update]
    end
  end

  get '/admin/renew', to: 'admin/members#renew'

  get '/members/mailer', to: 'members#mailer'
  post '/members/search_by', to: 'members#search_by'

end
