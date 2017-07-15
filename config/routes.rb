Rails.application.routes.draw do

  # get '/members/sign_up', to: 'members#index'
  # get '/members/password', to: 'members#index'

  root to: "application#angular"

  scope :api do
    devise_for :members, :controllers => {:sessions => 'sessions'}
    resources :members, only: [:index]
  end

  # resources :members, only: [:index]
  # resources :rentals, only: [:index]
  #
  # authenticate :member do
  #   resources :members, only: [:show]
  #   resources :workshops, only: [:show, :index] do
  #     resources :skills, only: [:index, :create, :update, :destroy]
  #     resources :members, only: [:edit, :update]
  #   end
  #   namespace :admin  do
  #     resources :payments
  #     resources :cards, only: [:new, :create]
  #     resources :rentals, only: [:new, :create, :edit, :update]
  #     resources :members, only: [:new, :create, :edit, :update]
  #     resources :workshops, only: [:new, :create, :edit, :update, :destroy]
  #   end
  #   get '/admin/renew', to: 'admin/members#renew'
  #   get '/workshops/:id/check_role', to: 'workshops#check_role'
  #   post '/workshops/:id/train', to: 'workshops#train'
  #   get '/workshops/:id/retrain_all', to: 'workshops#retrain_all', as: :retrain_workshop
  #   post '/workshops/:id/expert', to: 'workshops#make_expert'
  # end
  #
  # get '/members/mailer', to: 'members#mailer'
  # post '/members/search_by', to: 'members#search_by'

end
