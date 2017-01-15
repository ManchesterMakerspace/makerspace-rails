Rails.application.routes.draw do

  devise_for :members, :controllers => {:confirmations => 'confirmations'}
  root to: "members#index"

  resources :members, only: [:index]

  authenticate :member do
    resources :members, only: [:show]
    resources :skills, only: [:edit, :destroy]
    resources :workshops, except: [:new, :create] do
      resources :skills, only: [:index, :new, :create, :edit, :update, :destroy]
      resources :members, only: [:edit, :update]
    end
    namespace :admin  do
      resources :members, only: [:new, :create, :show, :edit, :update]
      resources :workshops, only: [:new, :create, :edit, :update]
    end
  end

  get '/admin/renew', to: 'admin/members#renew'

  get '/admin/backup', to: 'admin#backup'

  get '/members/mailer', to: 'members#mailer'
  post '/members/search_by', to: 'members#search_by'

end
