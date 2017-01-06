# README
This is an interface to review which members are signed off on which stations.  This can be expanded to handle the access points.  If logged in (feature for officers & admin), you can also see member expiration dates and renew members.  

Entry point is config.ru.
"app" folder contains MVC framework.
config/routes.rb contains routes for MVC.

# INSTALLATION
Must have MongoDB makerauth running on localhost:27017.

Clone to local, cd into repo
run: bundle install  #Bundler is Ruby library that will install and load all required libraries for this app
run: rails s or rails server #Ruby on Rails server defaults to port 3000. Application will be immediately viewable at localhost:3000.
