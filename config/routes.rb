Rails.application.routes.draw do

  get '/members/sign_up', to: 'members#index'
  devise_for :members, :controllers => {:confirmations => 'confirmations'}
  root to: "members#index"

  resources :members, only: [:index]

  authenticate :member do
    resources :members, only: [:show]
    resources :workshops, only: [:show, :index] do
      resources :skills, only: [:index, :create, :update, :destroy]
      resources :members, only: [:edit, :update]
    end
    namespace :admin  do
      resources :members, only: [:new, :create, :edit, :update]
      resources :workshops, only: [:new, :create, :edit, :update, :destroy]
    end
    get '/admin/renew', to: 'admin/members#renew'
    post '/workshops/:id/train', to: 'workshops#train'
    get '/workshops/:id/retrain_all', to: 'workshops#retrain_all', as: :retrain_workshop
    post '/workshops/:id/expert', to: 'workshops#make_expert'
  end

  get '/members/mailer', to: 'members#mailer'
  post '/members/search_by', to: 'members#search_by'

end
