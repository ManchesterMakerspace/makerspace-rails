Rails.application.routes.draw do
  get 'workshops/index'

  get 'workshops/show'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  resources :members, except: [:show]
  root to: "members#index"

  get '/members/mailer', to: 'members#mailer'
  get '/members/:id', to: 'members#show'

  post '/members/search_by', to: 'members#search_by'
end
