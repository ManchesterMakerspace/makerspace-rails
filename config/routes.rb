Rails.application.routes.draw do

  root to: "members#index"

  resources :members, only: [:index]
  get '/workshops/new', to: 'admin/workshops#new'

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

  get 'login', to: 'sessions#new'
  get 'logout', to: 'sessions#destroy'

  get '/members/mailer', to: 'members#mailer'
  post '/members/search_by', to: 'members#search_by'

end
