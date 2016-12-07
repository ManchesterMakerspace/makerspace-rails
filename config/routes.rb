Rails.application.routes.draw do

  root to: "members#index"

  get 'login', to: 'sessions#new'
  get 'logout', to: 'sessions#destroy'

  get 'workshops/index'
  get 'workshops/show'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  resources :members
  # patch '/members/:id/revoke', to: 'members#revoke'
  get '/members/mailer', to: 'members#mailer'
  post '/members/search_by', to: 'members#search_by'
  post '/members/:id/revoke', to: 'members#revoke', as: 'revoke'
  post '/members/:id/restore', to: 'members#restore', as: 'restore'

end
